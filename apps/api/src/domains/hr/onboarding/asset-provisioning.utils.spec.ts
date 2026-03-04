import {
  calculateAssetProvisioningEstimatedCost,
  shouldRequireFinanceApproval,
} from './asset-provisioning.utils';

describe('asset-provisioning.utils', () => {
  it('sums estimated equipment cost for approval decisions', () => {
    expect(
      calculateAssetProvisioningEstimatedCost([
        { item: 'Laptop', estimatedCost: 1200 },
        { item: 'Monitor', estimatedCost: 350 },
      ]),
    ).toBe(1550);
  });

  it('requires finance approval once the default threshold is crossed', () => {
    expect(
      shouldRequireFinanceApproval({
        equipment: [
          { item: 'Laptop', estimatedCost: 1200 },
          { item: 'Phone', estimatedCost: 400 },
        ],
      }),
    ).toBe(true);
  });

  it('preserves explicit finance approval requirements', () => {
    expect(
      shouldRequireFinanceApproval({
        equipment: [{ item: 'Mouse', estimatedCost: 25 }],
        financeApprovalRequired: true,
      }),
    ).toBe(true);
  });
});
