type CompensationComponentRow = {
  id: string;
  userId: string;
  name: string;
  type: string;
  amount: { toString(): string } | string | number;
  isRecurring: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mapCompensationComponent = (
  component: CompensationComponentRow,
) => ({
  id: component.id,
  userId: component.userId,
  name: component.name,
  type: component.type,
  amount: component.amount.toString(),
  isRecurring: component.isRecurring,
  effectiveFrom: component.effectiveFrom.toISOString(),
  effectiveTo: component.effectiveTo?.toISOString() ?? null,
  createdAt: component.createdAt.toISOString(),
  updatedAt: component.updatedAt.toISOString(),
});
