
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
