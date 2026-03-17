/** HR_LOGIC §6.1: window 15d before end; self due 14d after; manager 7d after self; close 30d after. */
const WINDOW_OPEN_DAYS_BEFORE = 15;
const SELF_ASSESSMENT_DAYS_AFTER = 14;
const MANAGER_REVIEW_DAYS_AFTER_SELF = 7;
const WINDOW_CLOSE_DAYS_AFTER = 30;

function lastDayOfQuarter(year: number, quarter: number): Date {
  const month = quarter * 3;
  return new Date(year, month, 0);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function subDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

export function getReviewWindowForQuarter(
  year: number,
  quarter: number,
): {
  windowOpensAt: Date;
  selfAssessmentDueAt: Date;
  managerReviewDueAt: Date;
  windowClosesAt: Date;
} {
  const endOfPeriod = lastDayOfQuarter(year, quarter);
  return {
    windowOpensAt: subDays(endOfPeriod, WINDOW_OPEN_DAYS_BEFORE),
    selfAssessmentDueAt: addDays(endOfPeriod, SELF_ASSESSMENT_DAYS_AFTER),
    managerReviewDueAt: addDays(
      endOfPeriod,
      SELF_ASSESSMENT_DAYS_AFTER + MANAGER_REVIEW_DAYS_AFTER_SELF,
    ),
    windowClosesAt: addDays(endOfPeriod, WINDOW_CLOSE_DAYS_AFTER),
  };
}
