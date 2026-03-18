import type {
  ApplicantResponseDto as ApplicantResponseContract,
  ApplyToJobDto as ApplyToJobContract,
} from '@repo/types';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { JobsController } from './jobs.controller';

const createUseCase = () => ({
  execute: jest.fn(),
});

describe('JobsController', () => {
  it('maps apply payload to CreateApplicantUseCase using the path job id', async () => {
    const createJob = createUseCase();
    const createApplicant = createUseCase();
    const listJobs = createUseCase();
    const getJobById = createUseCase();
    const updateJobById = createUseCase();
    const submitJobById = createUseCase();
    const approveJobById = createUseCase();
    const publishJobById = createUseCase();
    const closeJobById = createUseCase();
    const upsertJobSkills = createUseCase();
    const upsertJobTools = createUseCase();
    const upsertJobResponsibilities = createUseCase();
    const response = { id: 'app-1' } as ApplicantResponseContract;
    const payload: ApplyToJobContract = {
      firstName: 'Abel',
      lastName: 'Tesfaye',
      email: 'abel.tesfaye@example.com',
      resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
      phone: '+251912345678',
    };
    createApplicant.execute.mockResolvedValue(response);

    const controller = new JobsController(
      createJob as never,
      createApplicant as never,
      listJobs as never,
      getJobById as never,
      updateJobById as never,
      submitJobById as never,
      approveJobById as never,
      publishJobById as never,
      closeJobById as never,
      upsertJobSkills as never,
      upsertJobTools as never,
      upsertJobResponsibilities as never,
    );

    await expect(controller.apply('job-1', payload as never)).resolves.toBe(
      response,
    );
    expect(createApplicant.execute).toHaveBeenCalledWith({
      ...payload,
      jobId: 'job-1',
    });
  });

  it('marks apply as a public route', () => {
    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, JobsController.prototype.apply),
    ).toBe(true);
  });
});
