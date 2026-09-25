import { Request, Response } from 'express';
import { AiChatService } from '../services/aiChatService';
import { RiskAnalysisService } from '../services/riskAnalysisService';
import { fallbackDb } from '../db/fallbackDb';

export const handleAiChat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const userRole = (req as any).user?.role;
    const response = await AiChatService.processQuery(message, userRole);
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      answer: 'An operational error occurred while processing your request.',
      sources: [],
      timestamp: new Date().toISOString(),
    });
  }
};

export const getAiRiskSummary = async (req: Request, res: Response) => {
  try {
    const { summary } = RiskAnalysisService.getRiskSummary();
    return res.json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to compute risk summary.' });
  }
};

export const getAiRiskShipments = async (req: Request, res: Response) => {
  try {
    const { summary, shipments } = RiskAnalysisService.getRiskSummary();
    const { riskLevel, status, search } = req.query;

    let filtered = shipments;

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      filtered = filtered.filter(s => s.riskLevel.toLowerCase() === riskLevel.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      filtered = filtered.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.shipmentId.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.reason.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: filtered.length,
      totalAnalyzed: summary.totalAnalyzed,
      shipments: filtered,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve shipment risk analysis.' });
  }
};

export const getShipmentRiskById = async (req: Request, res: Response) => {
  try {
    const { shipmentId } = req.params;
    const term = (shipmentId || '').toUpperCase();
    const ship = fallbackDb.shipments.find(s => s.id.toUpperCase() === term || s.trackingNumber.toUpperCase() === term);

    if (!ship) {
      return res.status(404).json({ success: false, message: `Shipment ${shipmentId} not found.` });
    }

    const evaluation = RiskAnalysisService.evaluateShipmentRisk(ship);
    return res.json({ success: true, data: evaluation });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to evaluate shipment.' });
  }
};

export const getMlFeasibilityStatus = async (req: Request, res: Response) => {
  try {
    const status = RiskAnalysisService.evaluateMLFeasibility();
    return res.json({ success: true, data: status });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to inspect ML feasibility.' });
  }
};
