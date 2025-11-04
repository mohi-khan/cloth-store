import { Request, Response } from 'express'
import { getCashReport } from '../services/report.service'

export const getCashReportController = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "Missing startDate or endDate" });
    }

    const data = await getCashReport(startDate as string, endDate as string);
    res.json(data);
  } catch (error) {
    console.error("Error fetching cash report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
