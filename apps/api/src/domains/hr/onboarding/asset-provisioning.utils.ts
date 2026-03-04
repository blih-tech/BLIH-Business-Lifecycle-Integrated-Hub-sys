import type { AssetProvisioningEquipmentItem } from '@repo/types';

const DEFAULT_FINANCE_APPROVAL_THRESHOLD = 1500;

function getFinanceApprovalThreshold() {
  const value = Number(process.env.HR_ASSET_FINANCE_APPROVAL_THRESHOLD);
  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_FINANCE_APPROVAL_THRESHOLD;
}

export function calculateAssetProvisioningEstimatedCost(
  equipment?: AssetProvisioningEquipmentItem[] | null,
) {
  return Number(
    (equipment ?? [])
      .reduce(
        (total, item) =>
          total +
          (typeof item.estimatedCost === 'number' &&
          Number.isFinite(item.estimatedCost) &&
          item.estimatedCost > 0
            ? item.estimatedCost
            : 0),
        0,
      )
      .toFixed(2),
  );
}

export function shouldRequireFinanceApproval(input: {
  equipment?: AssetProvisioningEquipmentItem[] | null;
  financeApprovalRequired?: boolean | null;
}) {
  if (input.financeApprovalRequired) {
    return true;
  }

  return (
    calculateAssetProvisioningEstimatedCost(input.equipment) >=
    getFinanceApprovalThreshold()
  );
}
