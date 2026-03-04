export function calculateTrainingBudget(
  teamSize: number,
  previousYearUtilization: number,
) {
  if (teamSize <= 0) return { totalBudget: 0, perPersonAmount: 0 };
  let m = 1.0;
  if (previousYearUtilization < 0.5) m = 0.8;
  else if (previousYearUtilization > 0.9) m = 1.1;
  const perPerson = Math.round(10000 * m);
  return { totalBudget: perPerson * teamSize, perPersonAmount: perPerson };
}
