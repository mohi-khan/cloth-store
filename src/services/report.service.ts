import { db } from "../config/database";
import { sql } from "drizzle-orm";

export const getCashReport = async (startDate: string, endDate: string) => {
  const query = sql`
    SELECT rcv.transaction_id,
           rcv.transaction_type,
           rcv.is_cash,
           rcv.customer_id,
           customer.name AS customer_name,
           rcv.vendor_id,
           vendor.name AS vendor_name,
           rcv.transaction_date
    FROM transaction AS rcv
    LEFT JOIN customer ON customer.customer_id = rcv.customer_id
    LEFT JOIN vendor   ON vendor.vendor_id   = rcv.vendor_id
    WHERE rcv.transaction_type = 'recieved'
      AND rcv.is_cash = 1
      AND rcv.transaction_date BETWEEN ${startDate} AND ${endDate}

    UNION

    SELECT payment.transaction_id,
           payment.transaction_type,
           payment.is_cash,
           payment.customer_id,
           customer.name AS customer_name,
           payment.vendor_id,
           vendor.name AS vendor_name,
           payment.transaction_date
    FROM transaction AS payment
    LEFT JOIN customer ON customer.customer_id = payment.customer_id
    LEFT JOIN vendor   ON vendor.vendor_id   = payment.vendor_id
    WHERE payment.transaction_type = 'payment'
      AND payment.is_cash = 1
      AND payment.transaction_date BETWEEN ${startDate} AND ${endDate};
  `;

  const [rows] = await db.execute(query);
  return rows;
};
