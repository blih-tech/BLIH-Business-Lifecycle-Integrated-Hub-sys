import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'toNumber' in value) {
    const candidate = value as { toNumber?: () => number };
    const parsed = candidate.toNumber?.();
    return typeof parsed === 'number' && Number.isFinite(parsed)
      ? parsed
      : null;
  }
  return null;
}

function midpoint(min: number | null, max: number | null): number | null {
  if (min != null && max != null) return (min + max) / 2;
  return min ?? max;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function normalizeOfferPackage(
  prisma: PrismaService,
  input: {
    candidateId: string;
    recruitmentRequestId: string;
    jobPostingId: string;
    offer?: Record<string, unknown> | null;
    createIfMissing?: boolean;
  },
) {
  const [request, posting] = await Promise.all([
    prisma.recruitmentRequest.findUnique({
      where: { id: input.recruitmentRequestId },
      select: {
        departmentId: true,
        staffing: true,
        position: {
          select: {
            id: true,
            grade: {
              select: {
                minSalary: true,
                maxSalary: true,
              },
            },
          },
        },
      },
    }),
    prisma.jobPosting.findUnique({
      where: { id: input.jobPostingId },
      select: {
        positionId: true,
      },
    }),
  ]);

  const [screening, interviewFeedback, teamCompensations] = await Promise.all([
    prisma.cvScreening.findFirst({
      where: { candidateId: input.candidateId },
      orderBy: { screenedAt: 'desc' },
      select: { aggregateRating: true },
    }),
    prisma.interviewFeedback.findMany({
      where: { candidateId: input.candidateId },
      select: { totalRating: true },
    }),
    prisma.userCompensation.findMany({
      where: posting?.positionId
        ? {
            employee: {
              employment: {
                is: {
                  positionId: posting.positionId,
                },
              },
            },
          }
        : {
            employee: {
              employment: {
                is: {
                  position: {
                    departmentId: request?.departmentId,
                  },
                },
              },
            },
          },
      select: { baseSalary: true, currency: true },
    }),
  ]);

  const staffing = asRecord(request?.staffing);
  const salaryBracket = asRecord(staffing?.salaryBracket);

  const minBudget =
    readNumber(salaryBracket?.min) ??
    readNumber(request?.position?.grade?.minSalary) ??
    null;
  const maxBudget =
    readNumber(salaryBracket?.max) ??
    readNumber(request?.position?.grade?.maxSalary) ??
    null;
  const currency =
    String(
      input.offer?.currency ??
        salaryBracket?.currency ??
        teamCompensations.find((entry) => entry.currency)?.currency ??
        'ETB',
    ) || 'ETB';

  const candidateScore =
    readNumber(screening?.aggregateRating) ??
    (interviewFeedback.length > 0
      ? interviewFeedback.reduce(
          (sum, entry) => sum + (readNumber(entry.totalRating) ?? 0),
          0,
        ) / interviewFeedback.length
      : null);

  const teamAveragePay =
    teamCompensations.length > 0
      ? teamCompensations.reduce(
          (sum, entry) => sum + (readNumber(entry.baseSalary) ?? 0),
          0,
        ) / teamCompensations.length
      : null;

  const marketRate = midpoint(minBudget, maxBudget) ?? teamAveragePay;
  const premiumPercent =
    candidateScore != null && candidateScore >= 95
      ? 10
      : candidateScore != null && candidateScore >= 90
        ? 5
        : 0;

  const suggestedPay =
    marketRate != null
      ? roundMoney(marketRate * (1 + premiumPercent / 100))
      : null;

  const baseOffer = { ...(input.offer ?? {}) };
  const providedTotalPay = readNumber(baseOffer.totalPay);
  const totalPay =
    providedTotalPay ??
    (input.createIfMissing
      ? (suggestedPay ?? minBudget ?? teamAveragePay)
      : null);

  if (totalPay == null) {
    return input.offer ?? null;
  }

  if (maxBudget != null && totalPay > maxBudget) {
    throw new BadRequestException(
      `Offer total pay exceeds approved budget cap of ${maxBudget} ${currency}`,
    );
  }

  const internalEquityFlag =
    teamAveragePay != null && totalPay > teamAveragePay * 1.2;

  return {
    ...baseOffer,
    totalPay: roundMoney(totalPay),
    currency,
    analysis: {
      candidateScore,
      marketRate,
      suggestedPay,
      premiumPercent,
      minBudget,
      maxBudget,
      teamAveragePay,
      internalEquityFlag,
    },
  };
}
