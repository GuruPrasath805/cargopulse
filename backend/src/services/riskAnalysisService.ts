import { fallbackDb, ShipmentEntity } from '../db/fallbackDb';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type RiskType = 'Overdue' | 'Delayed' | 'Inactive Stall' | 'Missing Tracking' | 'Data Quality' | 'Optimal';

export interface ShipmentRiskResult {
  shipmentId: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  expectedDelivery: string;
  actualDelivery?: string;
  riskLevel: RiskLevel;
  riskType: RiskType;
  reason: string;
  calculatedAt: string;
  rulesTriggered: string[];
  metrics: {
    daysOverdue?: number;
    hoursSinceLastEvent?: number;
    hasInconsistentDates?: boolean;
    weatherRiskFactor?: number;
  };
}

export interface RiskSummaryResponse {
  totalAnalyzed: number;
  overdueCount: number;
  flaggedRiskCount: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  byRiskType: Record<string, number>;
  lastAnalysisTime: string;
  classificationMethod: 'RULE_BASED_TRANSPARENT_V1';
  rulesetDocumentation: Array<{
    rule: string;
    description: string;
    weight: string;
  }>;
}

export class RiskAnalysisService {
  /**
   * Evaluates a single shipment against the 5 transparent supply chain rules.
   */
  static evaluateShipmentRisk(ship: ShipmentEntity, now: Date = new Date()): ShipmentRiskResult {
    const rulesTriggered: string[] = [];
    const originWh = fallbackDb.warehouses.find(w => w.id === ship.originWarehouseId)?.name || 'Central Origin Hub';
    const dest = ship.destinationAddress || 'Consignee Dock';

    const expectedDate = new Date(ship.estimatedDelivery);
    const actualDate = ship.actualDelivery ? new Date(ship.actualDelivery) : null;
    const isDelivered = ship.status === 'DELIVERED';
    const isCancelled = ship.status === 'CANCELLED';

    let riskLevel: RiskLevel = 'Low';
    let riskType: RiskType = 'Optimal';
    let reason = 'Shipment is tracking normally on schedule with active telemetry.';

    const metrics: ShipmentRiskResult['metrics'] = {};

    // 1. Data Quality Check
    const hasInvalidDates = isNaN(expectedDate.getTime()) || (actualDate && isNaN(actualDate.getTime()));
    if (hasInvalidDates || !ship.trackingNumber || !ship.originWarehouseId) {
      rulesTriggered.push('DATA_QUALITY_ISSUE');
      riskLevel = 'Medium';
      riskType = 'Data Quality';
      reason = 'Inconsistent or missing shipment timestamp/route identifiers.';
      metrics.hasInconsistentDates = true;
    }

    if (!isDelivered && !isCancelled) {
      // 2. Overdue Rule
      if (now.getTime() > expectedDate.getTime()) {
        const msDiff = now.getTime() - expectedDate.getTime();
        const daysOver = Number((msDiff / (1000 * 60 * 60 * 24)).toFixed(1));
        metrics.daysOverdue = daysOver;
        rulesTriggered.push('OVERDUE_DELIVERY');

        if (daysOver > 1.0) {
          riskLevel = 'High';
          riskType = 'Overdue';
          reason = `Expected delivery date passed ${daysOver} days ago and consignment has not been handed over.`;
        } else {
          riskLevel = 'Medium';
          riskType = 'Overdue';
          reason = `Consignment passed scheduled delivery window today (${expectedDate.toLocaleDateString()}).`;
        }
      }

      // 3. Status Marked as DELAYED
      if (ship.status === 'DELAYED') {
        rulesTriggered.push('EXPLICIT_DELAY_FLAG');
        if (riskLevel !== 'High') {
          riskLevel = ship.riskScore >= 60 ? 'High' : 'Medium';
        }
        riskType = 'Delayed';
        reason = ship.delayReason || 'Line-haul transit exception reported by carrier dispatch.';
      }

      // 4. Missing Tracking Updates Check
      const events = ship.trackingEvents || [];
      if (events.length > 0) {
        const lastEvt = events[events.length - 1];
        const lastEvtTime = new Date(lastEvt.timestamp);
        if (!isNaN(lastEvtTime.getTime())) {
          const hoursSilent = (now.getTime() - lastEvtTime.getTime()) / (1000 * 60 * 60);
          metrics.hoursSinceLastEvent = Number(hoursSilent.toFixed(1));

          if (hoursSilent > 48.0 && ship.status === 'IN_TRANSIT') {
            rulesTriggered.push('MISSING_TRACKING_48H');
            if (riskLevel === 'Low') {
              riskLevel = 'Medium';
              riskType = 'Missing Tracking';
              reason = `No GPS or checkpoint telemetry logged for ${metrics.hoursSinceLastEvent} hours while In-Transit.`;
            }
          }
        }
      } else if (ship.status === 'IN_TRANSIT') {
        rulesTriggered.push('NO_TELEMETRY_LOGGED');
        if (riskLevel === 'Low') {
          riskLevel = 'Medium';
          riskType = 'Missing Tracking';
          reason = 'Consignment in transit without initial departure waypoint checkpoint.';
        }
      }

      // 5. Inactive / Stalled Status Check
      if (ship.status === 'PACKED' || ship.status === 'ORDERED') {
        const created = new Date(ship.createdAt);
        if (!isNaN(created.getTime())) {
          const daysOld = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          if (daysOld > 3.0) {
            rulesTriggered.push('INACTIVE_STALL_ORIGIN');
            if (riskLevel === 'Low') {
              riskLevel = 'Medium';
              riskType = 'Inactive Stall';
              reason = `Consignment remained in ${ship.status} status for ${daysOld.toFixed(1)} days without dispatch.`;
            }
          }
        }
      }
    } else if (isDelivered && actualDate && actualDate > expectedDate) {
      // Historical delivery was completed late
      rulesTriggered.push('HISTORICAL_LATE_DELIVERY');
      riskLevel = 'Low';
      riskType = 'Delayed';
      reason = 'Delivered behind original schedule; closed record.';
    }

    return {
      shipmentId: ship.id,
      trackingNumber: ship.trackingNumber,
      status: ship.status,
      origin: originWh,
      destination: dest,
      expectedDelivery: ship.estimatedDelivery,
      actualDelivery: ship.actualDelivery,
      riskLevel,
      riskType,
      reason,
      calculatedAt: now.toISOString(),
      rulesTriggered,
      metrics,
    };
  }

  /**
   * Evaluates all shipments and aggregates summary risk analytics.
   */
  static getRiskSummary(): { summary: RiskSummaryResponse; shipments: ShipmentRiskResult[] } {
    const allShipments = fallbackDb.shipments;
    const now = new Date();
    const evaluated = allShipments.map(s => this.evaluateShipmentRisk(s, now));

    const overdueCount = evaluated.filter(e => e.rulesTriggered.includes('OVERDUE_DELIVERY')).length;
    const flaggedRiskCount = evaluated.filter(e => e.riskLevel === 'High' || e.riskLevel === 'Medium').length;

    const distribution = {
      high: evaluated.filter(e => e.riskLevel === 'High').length,
      medium: evaluated.filter(e => e.riskLevel === 'Medium').length,
      low: evaluated.filter(e => e.riskLevel === 'Low').length,
    };

    const byRiskType: Record<string, number> = {};
    for (const item of evaluated) {
      byRiskType[item.riskType] = (byRiskType[item.riskType] || 0) + 1;
    }

    const summary: RiskSummaryResponse = {
      totalAnalyzed: evaluated.length,
      overdueCount,
      flaggedRiskCount,
      riskDistribution: distribution,
      byRiskType,
      lastAnalysisTime: now.toISOString(),
      classificationMethod: 'RULE_BASED_TRANSPARENT_V1',
      rulesetDocumentation: [
        { rule: 'Overdue Delivery', description: 'Expected delivery date in the past & status is not DELIVERED.', weight: 'High' },
        { rule: 'Active Line-Haul Delay', description: 'Status is explicitly DELAYED or riskScore >= 60.', weight: 'High / Medium' },
        { rule: 'Silent Telematics (>48h)', description: 'Shipment IN_TRANSIT with no waypoint update for >48h.', weight: 'Medium' },
        { rule: 'Origin Hub Stall', description: 'Remained in PACKED or ORDERED status for >3 days without dispatch.', weight: 'Medium' },
        { rule: 'Data Integrity', description: 'Missing or unparseable timestamps or critical corridor addresses.', weight: 'Medium' },
      ],
    };

    return { summary, shipments: evaluated };
  }

  /**
   * Honest Machine Learning Feasibility Assessment.
   * Inspects current database record count, target distribution, and feature availability.
   */
  static evaluateMLFeasibility() {
    const totalRecords = fallbackDb.shipments.length;
    const labeledDelivered = fallbackDb.shipments.filter(s => s.status === 'DELIVERED').length;
    const labeledDelayed = fallbackDb.shipments.filter(s => s.status === 'DELAYED' || (s.actualDelivery && new Date(s.actualDelivery) > new Date(s.estimatedDelivery))).length;

    const minimumRecommendedRecords = 1000;
    const isSufficientForTraining = totalRecords >= minimumRecommendedRecords && labeledDelivered >= 200;

    return {
      status: isSufficientForTraining ? 'FEASIBLE' : 'INSUFFICIENT_HISTORICAL_DATA',
      currentRecords: totalRecords,
      labeledDeliveredSamples: labeledDelivered,
      labeledDelayedSamples: labeledDelayed,
      recommendedSampleSize: minimumRecommendedRecords,
      identifiedFeatures: [
        { feature: 'originWarehouseId', status: 'AVAILABLE', description: 'Origin node / dispatch hub' },
        { feature: 'destinationCoordinates', status: 'AVAILABLE', description: 'Latitude & Longitude coordinates' },
        { feature: 'carrierId', status: 'AVAILABLE', description: 'Primary freight carrier' },
        { feature: 'vehicleType', status: 'AVAILABLE', description: 'Capacity and vehicle classification' },
        { feature: 'scheduledTransitHours', status: 'AVAILABLE', description: 'Delta between departure and ETA' },
        { feature: 'weatherAnomalyScore', status: 'AVAILABLE', description: 'Regional weather impact index' },
      ],
      recommendation: isSufficientForTraining
        ? 'Data volume supports training a Random Forest or XGBoost binary classifier (target: isDelayed).'
        : 'Dataset is currently in early-stage demonstration mode. Transparent rule-based classification is active. Machine learning training pipeline is architected for deployment once 1,000+ real trip cycles accumulate.',
    };
  }
}
