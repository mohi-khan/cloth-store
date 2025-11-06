import { db } from '../config/database'
import { and, eq, isNotNull, lte, sql } from 'drizzle-orm'
import {
  openingBalanceModel,
  salesTransactionModel,
  transactionModel,
} from '../schemas'

interface GetCashOpeningBalanceParams {
  date: string // 'YYYY-MM-DD'
  closingFlag: boolean
}

interface GetPartyOpeningBalanceParams {
  date: string // 'YYYY-MM-DD'
  closingFlag: boolean
  partyId: number
}
interface CashReportRow {
  id: number
  date: string
  particular: string
  amount: number
}

//cash report
export const getCashOpeningBalance = async ({
  date,
  closingFlag,
}: GetCashOpeningBalanceParams) => {
  // 1️⃣ Get opening cash balance (assuming isParty = false means cash)

  const opening = await db
    .select({
      openingAmount: openingBalanceModel.openingAmount,
    })
    .from(openingBalanceModel)
    .where(
      and(
        eq(openingBalanceModel.isParty, false),
        eq(openingBalanceModel.type, 'debit')
      )
    )
    .limit(1)

  let balance = opening ? opening[0].openingAmount : 0

  // 2️⃣ Sum cash transactions before the date
  const txSum = await db
    .select({
      totalReceived: sql<number>`COALESCE(SUM(CASE WHEN ${transactionModel.transactionType} = 'received' THEN ${transactionModel.amount} ELSE 0 END), 0)`,
      totalPayment: sql<number>`COALESCE(SUM(CASE WHEN ${transactionModel.transactionType} = 'payment' THEN ${transactionModel.amount} ELSE 0 END), 0)`,
      totalContra: sql<number>`COALESCE(SUM(CASE WHEN ${transactionModel.transactionType} = 'contra' THEN ${transactionModel.amount} ELSE 0 END), 0)`,
    })
    .from(transactionModel)
    .where(
      and(
        eq(transactionModel.isCash, true),
        lte(transactionModel.transactionDate, new Date(date))
      )
    )
    .limit(1)

  // 3️⃣ Adjust balance based on transaction type
  if (txSum.length) {
    balance +=
      txSum[0].totalReceived - txSum[0].totalPayment + txSum[0].totalContra
  }

  const result: CashReportRow[] = [
    {
      id: Date.now(),
      date,
      particular: closingFlag ? 'Closing Balance' : 'Opening Balance',
      amount: balance,
    },
  ]
  return result
}

export const getCashReport = async (startDate: string, endDate: string) => {
  console.log(startDate)
  console.log(endDate)
  const startDateParam: GetCashOpeningBalanceParams = {
    date: startDate,
    closingFlag: false,
  }

  // Make sure to await the function
  const openingBalanceRows = await getCashOpeningBalance(startDateParam)

  const query = sql`
  SELECT
    t.transaction_id AS id,      -- ✅ use existing database ID
    t.transaction_date AS date,
    t.amount,
    CASE
        WHEN t.transaction_type = 'received' THEN CONCAT('Received From ', c.name)
        WHEN t.transaction_type = 'payment' THEN CONCAT('Payment To ', v.name)
        ELSE NULL
    END AS particular
  FROM \`transaction\` t
  LEFT JOIN \`customer\` c ON t.customer_id = c.customer_id
  LEFT JOIN \`vendor\` v ON t.vendor_id = v.vendor_id
  WHERE t.is_cash = 1 AND t.transaction_date BETWEEN ${startDate} AND ${endDate};
`

  const [rows] = await db.execute<CashReportRow[]>(query)
  const transactionRows: CashReportRow[] = rows as unknown as CashReportRow[]
  const endDateObj = new Date(endDate)
  endDateObj.setDate(endDateObj.getDate() + 1)
  const closingDateStr = endDateObj.toISOString().split('T')[0] // 'YYYY-MM-DD'

  const endDateParam: GetCashOpeningBalanceParams = {
    date: closingDateStr,
    closingFlag: true,
  }
  const closingBalanceRows = await getCashOpeningBalance(endDateParam)
  const cashReport: CashReportRow[] = [
    ...openingBalanceRows,
    ...transactionRows,
    ...closingBalanceRows,
  ]

  return cashReport
}

//customer report
export const getCustomerOpeningBalance = async ({
  date,
  closingFlag,
  partyId,
}: GetPartyOpeningBalanceParams) => {
  // 1️⃣ Get opening balance for the customer
  const opening = await db
    .select({
      openingAmount: openingBalanceModel.openingAmount,
    })
    .from(openingBalanceModel)
    .where(
      and(
        eq(openingBalanceModel.isParty, true),
        eq(openingBalanceModel.customerId, partyId)
      )
    )
    .limit(1)

  // Safely handle missing opening balance row
  let balance =
    opening.length > 0 && opening[0]?.openingAmount
      ? Number(opening[0].openingAmount)
      : 0

  // 2️⃣ Sum transactions before the given date
  const txSum = await db
    .select({
      totalAmount: sql<number>`SUM(${salesTransactionModel.amount})`,
    })
    .from(salesTransactionModel)
    .where(
      and(
        eq(salesTransactionModel.customerId, partyId),
        lte(salesTransactionModel.transactionDate, new Date(date))
      )
    )

  // 3️⃣ Adjust balance if there are transactions
  if (txSum.length && txSum[0].totalAmount !== null) {
    balance += Number(txSum[0].totalAmount)
  }

  // 4️⃣ Return formatted result
  const result: CashReportRow[] = [
    {
      id: Date.now(),
      date,
      particular: closingFlag ? 'Closing Balance' : 'Opening Balance',
      amount: balance,
    },
  ]

  return result
}

export const getCustomerReport = async (
  startDate: string,
  endDate: string,
  partyId: number
) => {
  const startDateParam: GetPartyOpeningBalanceParams = {
    date: startDate,
    closingFlag: false,
    partyId: partyId,
  }

  // Make sure to await the function
  const openingBalanceRows = await getCustomerOpeningBalance(startDateParam)

  const query = sql`
  SELECT
    t.transaction_id AS id,
    transaction_date AS date,
    amount,
    t.reference_type AS particular
  FROM sales_transaction t
  WHERE t.customer_id = ${partyId}
  AND t.transaction_date BETWEEN ${startDate} AND ${endDate}
`
  const [rows] = await db.execute<CashReportRow[]>(query)
  const transactionRows: CashReportRow[] = rows as unknown as CashReportRow[]
  const endDateObj = new Date(endDate)
  endDateObj.setDate(endDateObj.getDate() + 1)
  const closingDateStr = endDateObj.toISOString().split('T')[0] // 'YYYY-MM-DD'

  const endDateParam: GetPartyOpeningBalanceParams = {
    date: closingDateStr,
    closingFlag: true,
    partyId: partyId,
  }
  const closingBalanceRows = await getCustomerOpeningBalance(endDateParam)
  const cashReport: CashReportRow[] = [
    ...openingBalanceRows,
    ...transactionRows,
    ...closingBalanceRows,
  ]

  return cashReport
}

export const getStockLedger = async (
  itemId: number,
  startDate: string,
  endDate: string
) => {
  console.log('que', itemId, startDate, endDate);

  const [rows] = await db.execute(sql`
    WITH combined AS (
      SELECT 
        UNIX_TIMESTAMP(DATE_SUB(${startDate}, INTERVAL 1 SECOND)) AS transaction_id,
        i.item_id,
        i.item_name,
        'Opening Stock' AS reference_type,
        NULL AS reference,
        SUM(st.quantity) AS quantity,
        DATE_SUB(${startDate}, INTERVAL 1 DAY) AS transaction_date,
        0 AS sort_order
      FROM store_transaction st
      INNER JOIN item i ON i.item_id = st.item_id
      WHERE st.item_id = ${itemId} 
        AND st.transaction_date < ${startDate}

      UNION ALL

      SELECT
        st.transaction_id,
        i.item_id,
        i.item_name,
        st.reference_type,
        st.reference,
        st.quantity,
        st.transaction_date,
        st.transaction_id AS sort_order
      FROM store_transaction st
      INNER JOIN item i ON i.item_id = st.item_id
      WHERE st.item_id = ${itemId} 
        AND st.transaction_date BETWEEN ${startDate} AND ${endDate}

      UNION ALL

      SELECT 
        UNIX_TIMESTAMP(${endDate} + INTERVAL 1 SECOND) AS transaction_id,
        i.item_id,
        i.item_name,
        'Closing Stock' AS reference_type,
        NULL AS reference,
        SUM(st.quantity) AS quantity,
        ${endDate} AS transaction_date,
        999999 AS sort_order
      FROM store_transaction st
      INNER JOIN item i ON i.item_id = st.item_id
      WHERE st.item_id = ${itemId} 
        AND st.transaction_date <= ${endDate}
    )
    SELECT
      transaction_id,
      item_id,
      item_name,
      reference_type,
      reference,
      quantity,
      transaction_date,
      SUM(quantity) OVER (ORDER BY transaction_date, sort_order ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance
    FROM combined
    ORDER BY transaction_date, sort_order;
  `);

  return rows;
};

