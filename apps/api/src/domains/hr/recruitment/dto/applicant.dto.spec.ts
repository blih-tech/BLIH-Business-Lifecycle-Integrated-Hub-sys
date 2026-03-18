import type { ArgumentMetadata } from '@nestjs/common';
import { ValidationPipe } from '../../../../shared/pipes/validation.pipe';
import { ApplyToJobDto } from './applicant.dto';

describe('ApplyToJobDto', () => {
  it('rejects jobId in the request body', async () => {
    const pipe = new ValidationPipe();
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: ApplyToJobDto,
      data: '',
    };

    await expect(
      pipe.transform(
        {
          jobId: 'job-1',
          firstName: 'Abel',
          lastName: 'Tesfaye',
          email: 'abel.tesfaye@example.com',
          resumeUrl: 'https://cdn.example.com/cv/abel.pdf',
        },
        metadata,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        fieldErrors: expect.arrayContaining([
          expect.objectContaining({
            field: 'jobId',
          }),
        ]),
      }),
    });
  });
});
