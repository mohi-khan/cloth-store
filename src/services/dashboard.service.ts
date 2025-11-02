import { db } from '../config/database'
import { sql } from 'drizzle-orm'

export const getItemSummaryService = async () => {
  const [rows] = await db.execute(sql`
    SELECT 
      i.item_name,
      SUM(s.quantity) AS totQty,
      AVG(i.avg_price) AS price
    FROM \`cloth-store\`.store_transaction AS s
    JOIN \`cloth-store\`.item AS i
      ON i.item_id = s.item_id
    GROUP BY i.item_id, i.item_name;
  `)

  return rows
}

export const getRemainingAmountService = async () => {
  const [rows] = await db.execute(sql`
    SELECT 
  c.customer_id,
  c.name AS customer_name,
  COALESCE(SUM(sm.total_amount), 0) AS total_sales,
  COALESCE(SUM(sm.discount_amount), 0) AS total_discount,
  COALESCE(SUM(IFNULL(t.total_received,0)), 0) AS total_received,
  coalesce(SUM(sm.total_amount)-SUM(IFNULL(t.total_received,0)),0) AS unpaid_amount
FROM customer AS c
LEFT JOIN (
  SELECT 
    customer_id, 
    SUM(total_amount) AS total_amount, 
    SUM(discount_amount) AS discount_amount
  FROM sales_master
  GROUP BY customer_id
) AS sm ON sm.customer_id = c.customer_id
LEFT JOIN (
  SELECT 
    customer_id, 
    SUM(amount) AS total_received
  FROM transaction
  WHERE transaction_type = 'recieved'
  GROUP BY customer_id
) AS t ON t.customer_id = c.customer_id
GROUP BY c.customer_id, c.name;
  `)

  return rows
}
