import { db } from "../config/database";
import { and, eq, lte, sql } from "drizzle-orm";
import { openingBalanceModel, transactionModel } from "../schemas";



interface GetCashOpeningBalanceParams {
  date: string, // 'YYYY-MM-DD'
  closingFlag:boolean;
}
interface CashReportRow {
  date: string;
  particular: string;
  amount: number;
}

export const getCashOpeningBalance = async ({ date,closingFlag }: GetCashOpeningBalanceParams) => {
  // 1️⃣ Get opening cash balance (assuming isParty = false means cash)

const opening = await db
    .select({
      openingAmount: openingBalanceModel.openingAmount,
    })
    .from(openingBalanceModel)
    .where(and(eq(openingBalanceModel.isParty, false), eq(openingBalanceModel.type, 'debit')))
    .limit(1);

  let balance = opening ? opening[0].openingAmount : 0;

  // 2️⃣ Sum cash transactions before the date
  const txSum = await db
    .select({
      totalReceived: sql<number>`COALESCE(SUM(CASE WHEN ${transactionModel.transactionType} = 'received' THEN ${transactionModel.amount} ELSE 0 END), 0)`,
      totalPayment: sql<number>`COALESCE(SUM(CASE WHEN ${transactionModel.transactionType} = 'payment' THEN ${transactionModel.amount} ELSE 0 END), 0)`,
      totalContra: sql<number>`COALESCE(SUM(CASE WHEN ${transactionModel.transactionType} = 'contra' THEN ${transactionModel.amount} ELSE 0 END), 0)`,
    })
    .from(transactionModel)
    .where(and(eq(transactionModel.isCash, true), lte(transactionModel.transactionDate, new Date(date))))
    .limit(1);

  // 3️⃣ Adjust balance based on transaction type
    if (txSum.length) {
    balance += txSum[0].totalReceived - txSum[0].totalPayment + txSum[0].totalContra;
  }

  const result: CashReportRow[] = [
    {
      date,
      particular: closingFlag ? 'Closing Balance' :'Opening Balance' ,
      amount: balance,
    },
  ]
  return result;
};

export const getCashReport = async (startDate: string, endDate: string) => {
  console.log(startDate);
  console.log(endDate);
  const startDateParam: GetCashOpeningBalanceParams = { date: startDate,closingFlag:false };

// Make sure to await the function
const openingBalanceRows = await getCashOpeningBalance(startDateParam);

const query = sql`SELECT

    transaction_date as date,

    amount,

    CASE
        WHEN t.transaction_type = 'received' THEN CONCAT('Received From ', c.name)
        WHEN t.transaction_type = 'payment' THEN CONCAT('Payment To ', v.name)
        ELSE NULL
        END AS particular
FROM clothmgt.transaction t
LEFT JOIN clothmgt.customer c ON t.customer_id = c.customer_id
LEFT JOIN clothmgt.vendor v ON t.vendor_id = v.vendor_id
WHERE is_cash = 1 and t.transaction_date between ${startDate} and ${endDate}`


    

   const [rows] = await db.execute<CashReportRow[]>(query);
   const transactionRows:CashReportRow[]=rows as unknown as CashReportRow[];
    const endDateObj = new Date(endDate);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const closingDateStr = endDateObj.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const endDateParam: GetCashOpeningBalanceParams = { date: closingDateStr,closingFlag:true };
  const closingBalanceRows = await getCashOpeningBalance(endDateParam)
   const cashReport: CashReportRow[] = [
    ...openingBalanceRows,
    ...transactionRows,
    ...closingBalanceRows
  ];


  return cashReport;
};
