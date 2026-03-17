/**
 * HR_LOGIC §8.2: Critical 24h SLA, High 72h, else 7 days (168h).
 */
import type { IncidentSeverity } from '@repo/types';

export const INCIDENT_SLA_HOURS: Record<IncidentSeverity, number> = {
  CRITICAL: 24,
  HIGH: 72,
  MEDIUM: 168,
  LOW: 168,
};

export function getSlaHoursForSeverity(severity: IncidentSeverity): number {
  return INCIDENT_SLA_HOURS[severity] ?? 168;
}

export function getInvestigationDueAt(slaHours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + slaHours);
  return d;
}
