import { Request, Response } from 'express'
import { getCashReport, getCustomerReport, getLoanReport, getStockLedger } from '../services/report.service'

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

export const getPartyReportController = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate,partyId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: "Missing startDate or endDate" });
    }
    // Convert types safely (req.query values are strings or string[])
const parsedPartyId = partyId ? Number(partyId) : 0;
    const data = await getCustomerReport(startDate as string, endDate as string,parsedPartyId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching Party report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const getStockLedgerController = async (req: Request, res: Response) => {
  try {
    const itemId = Number(req.query.itemId);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!itemId || !startDate || !endDate) {
      res.status(400).json({ message: "itemId, startDate and endDate are required" });
    }

    const ledger = await getStockLedger(itemId, startDate, endDate);
    res.json(ledger);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getLoanReportController = async (req: Request, res: Response) => {
  try {
    const unique_name = String(req.query.unique_name);

    if (!unique_name) {
      res.status(400).json({ message: "unique name is required" });
    }

    const ledger = await getLoanReport(unique_name);
    res.json(ledger);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};