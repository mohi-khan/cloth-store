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

type StockLedgerRow = {
  transaction_date: string
  reference_type: string
  quantity: number
  balance: number
  reference: string
}
type StockLedgerResult = StockLedgerRow & { id: number }

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
): Promise<StockLedgerResult[]> => {
  console.log('que', itemId, startDate, endDate)

  // Explicitly cast the result to an array of rows
  const result = (await db.execute(sql`
    WITH opening_stock AS (
      SELECT
          ${startDate} AS transaction_date,
          'Opening Stock' AS reference_type,
          IFNULL(SUM(quantity),0) AS quantity,
          0 AS reference,
          0 AS sort_order
      FROM store_transaction
      WHERE item_id = ${itemId}
        AND transaction_date < ${startDate}
    ),
    item_transactions AS (
      SELECT
          transaction_date,
          reference_type,
          IFNULL(quantity,0) AS quantity,
          IFNULL(reference, 0) AS reference,
          transaction_id AS sort_order
      FROM store_transaction
      WHERE item_id = ${itemId}
        AND transaction_date BETWEEN ${startDate} AND ${endDate}
    ),
    combined AS (
      SELECT * FROM opening_stock
      UNION ALL
      SELECT * FROM item_transactions
    )
    SELECT
        transaction_date,
        reference_type,
        quantity,
        SUM(quantity) OVER (ORDER BY transaction_date, sort_order ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance,
        reference
    FROM combined
    ORDER BY transaction_date, sort_order;
  `)) as unknown as [StockLedgerRow[], unknown]

  const rows = result[0] // ✅ guaranteed to be an array of rows

  let updatedRows: StockLedgerResult[] = rows.map((row) => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    ...row,
  }))

  if (rows.length > 0) {
    const lastElement = rows[rows.length - 1]

    updatedRows.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      transaction_date: endDate,
      reference_type: 'Closing Stock',
      quantity: lastElement.balance,
      balance: lastElement.balance,
      reference: "0",
    })
  }

  return updatedRows
}

export const getLoanReport = async (unique_name: string) => {
  const [rows] = await db.execute(sql`
   -- Loan received
    SELECT 
        l.loan_date AS date,
        'Received' AS type,
        l.loan_amount_receivable AS amount,
        l.remarks
    FROM loan l
    WHERE unique_name = ${unique_name}
    UNION
    -- Loan payments (expense)
    SELECT 
        e.expense_date AS date,
        'Payment' AS type,
        e.amount AS amount,
        e.remarks
    FROM expense e
    INNER JOIN account_head ON account_head.account_head_id = e.account_head_id
    WHERE account_head.name = ${unique_name}
    
    ORDER BY date
  `)

  return rows
}