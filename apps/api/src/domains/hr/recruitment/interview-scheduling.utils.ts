type InterviewParticipant = {
  userId?: string;
  employeeId?: string;
  name?: string;
  [key: string]: unknown;
};

type SchedulingWarning = {
  code: string;
  message: string;
};

function isParticipantRecord(value: unknown): value is InterviewParticipant {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export async function enrichInterviewersWithSchedulingWarnings(
  prisma: {
    employee: {
      findFirst(args: unknown): Promise<{ id: string } | null>;
    };
    leaveRequest: {
      findFirst(args: unknown): Promise<{ id: string } | null>;
    };
  },
  interviewers: unknown[] | null | undefined,
  scheduledAt: Date | null,
) {
  if (!interviewers?.length || !scheduledAt) {
    return {
      interviewers: interviewers ?? [],
      warnings: [] as SchedulingWarning[],
    };
  }

  const warnings: SchedulingWarning[] = [];
  const enriched = await Promise.all(
    interviewers.map(async (interviewer) => {
      if (!isParticipantRecord(interviewer)) return interviewer;

      const employee = await prisma.employee.findFirst({
        where: {
          OR: [
            interviewer.employeeId ? { id: interviewer.employeeId } : undefined,
            interviewer.userId ? { userId: interviewer.userId } : undefined,
          ].filter(Boolean),
        },
        select: { id: true },
      });

      const interviewerWarnings: SchedulingWarning[] = [];

      if (employee) {
        const leaveConflict = await prisma.leaveRequest.findFirst({
          where: {
            employeeId: employee.id,
            status: 'APPROVED',
            startDate: { lte: scheduledAt },
            endDate: { gte: scheduledAt },
          },
          select: { id: true },
        });

        if (leaveConflict) {
          interviewerWarnings.push({
            code: 'LEAVE_CONFLICT',
            message:
              'Interviewer has approved leave covering the scheduled time',
          });
        }
      }

      const hour = scheduledAt.getUTCHours();
      if (hour < 6 || hour > 16) {
        interviewerWarnings.push({
          code: 'OUTSIDE_CORE_HOURS',
          message: 'Interview is scheduled outside core working hours',
        });
      }

      warnings.push(...interviewerWarnings);

      return {
        ...interviewer,
        schedulingWarnings: interviewerWarnings,
      };
    }),
  );

  return {
    interviewers: enriched,
    warnings,
  };
}
