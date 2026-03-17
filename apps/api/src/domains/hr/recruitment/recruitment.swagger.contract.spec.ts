import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { ApplicantsController } from './applicants.controller';
import { InterviewQuestionsController } from './interview-questions.controller';
import { InterviewsController } from './interviews.controller';
import { JobsController } from './jobs.controller';
import { OffersController } from './offers.controller';
import {
  ApproveJobUseCase,
  CloseJobUseCase,
  CreateApplicantUseCase,
  CreateInterviewUseCase,
  CreateInterviewQuestionUseCase,
  CreateJobUseCase,
  CreateOfferUseCase,
  DeactivateInterviewQuestionUseCase,
  GetApplicantUseCase,
  GetInterviewUseCase,
  GetOfferUseCase,
  ListInterviewParticipantFeedbackUseCase,
  ListInterviewQuestionsUseCase,
  GetJobUseCase,
  ListApplicantsUseCase,
  ListInterviewsUseCase,
  ListJobsUseCase,
  ListOffersUseCase,
  PublishJobUseCase,
  RespondOfferUseCase,
  SendOfferUseCase,
  SubmitJobUseCase,
  UpdateInterviewParticipantAttendanceUseCase,
  UpdateInterviewQuestionUseCase,
  UpdateApplicantStatusUseCase,
  UpdateApplicantUseCase,
  UpdateInterviewUseCase,
  UpdateJobUseCase,
  UpdateOfferUseCase,
  UpsertInterviewFeedbackUseCase,
  UpsertJobResponsibilitiesUseCase,
  UpsertJobSkillsUseCase,
  UpsertJobToolsUseCase,
  WithdrawOfferUseCase,
} from './use-cases';

const useCaseTokens = [
  CreateJobUseCase,
  ListJobsUseCase,
  GetJobUseCase,
  UpdateJobUseCase,
  SubmitJobUseCase,
  ApproveJobUseCase,
  PublishJobUseCase,
  CloseJobUseCase,
  UpsertJobSkillsUseCase,
  UpsertJobToolsUseCase,
  UpsertJobResponsibilitiesUseCase,
  CreateApplicantUseCase,
  ListApplicantsUseCase,
  GetApplicantUseCase,
  UpdateApplicantUseCase,
  UpdateApplicantStatusUseCase,
  CreateInterviewUseCase,
  ListInterviewsUseCase,
  GetInterviewUseCase,
  UpdateInterviewUseCase,
  UpdateInterviewParticipantAttendanceUseCase,
  UpsertInterviewFeedbackUseCase,
  ListInterviewParticipantFeedbackUseCase,
  CreateInterviewQuestionUseCase,
  UpdateInterviewQuestionUseCase,
  DeactivateInterviewQuestionUseCase,
  ListInterviewQuestionsUseCase,
  CreateOfferUseCase,
  ListOffersUseCase,
  GetOfferUseCase,
  UpdateOfferUseCase,
  SendOfferUseCase,
  RespondOfferUseCase,
  WithdrawOfferUseCase,
] as const;

type HttpMethod = 'get' | 'post' | 'patch';

const expectedOperations: Array<{
  path: string;
  method: HttpMethod;
  expectsBody: boolean;
}> = [
  { path: '/hr/recruitment/jobs', method: 'post', expectsBody: true },
  { path: '/hr/recruitment/jobs', method: 'get', expectsBody: false },
  { path: '/hr/recruitment/jobs/{id}', method: 'get', expectsBody: false },
  { path: '/hr/recruitment/jobs/{id}', method: 'patch', expectsBody: true },
  {
    path: '/hr/recruitment/jobs/{id}/submit',
    method: 'post',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/jobs/{id}/approve',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/jobs/{id}/publish',
    method: 'post',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/jobs/{id}/close',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/jobs/{id}/skills',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/jobs/{id}/tools',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/jobs/{id}/responsibilities',
    method: 'post',
    expectsBody: true,
  },
  { path: '/hr/recruitment/applicants', method: 'post', expectsBody: true },
  { path: '/hr/recruitment/applicants', method: 'get', expectsBody: false },
  {
    path: '/hr/recruitment/applicants/{id}',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/applicants/{id}',
    method: 'patch',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/applicants/{id}/status',
    method: 'post',
    expectsBody: true,
  },
  { path: '/hr/recruitment/interviews', method: 'post', expectsBody: true },
  { path: '/hr/recruitment/interviews', method: 'get', expectsBody: false },
  {
    path: '/hr/recruitment/interviews/{id}',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/interviews/{id}',
    method: 'patch',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/interviews/{id}/participants/{participantId}/attendance',
    method: 'patch',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/interviews/{id}/participants/{participantId}/feedback',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/interviews/{id}/participants/{participantId}/feedback',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/interview-questions',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/interview-questions',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/interview-questions/{id}',
    method: 'patch',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/interview-questions/{id}/deactivate',
    method: 'patch',
    expectsBody: false,
  },
  { path: '/hr/recruitment/offers', method: 'post', expectsBody: true },
  { path: '/hr/recruitment/offers', method: 'get', expectsBody: false },
  { path: '/hr/recruitment/offers/{id}', method: 'get', expectsBody: false },
  { path: '/hr/recruitment/offers/{id}', method: 'patch', expectsBody: true },
  {
    path: '/hr/recruitment/offers/{id}/send',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/offers/{id}/respond',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/offers/{id}/withdraw',
    method: 'post',
    expectsBody: true,
  },
];

describe('Recruitment Swagger Contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const providers = useCaseTokens.map((token) => ({
      provide: token,
      useValue: { execute: jest.fn() },
    }));

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [
        JobsController,
        ApplicantsController,
        InterviewsController,
        InterviewQuestionsController,
        OffersController,
      ],
      providers,
    })
      .overrideGuard(KeycloakAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RbacGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('documents all recruitment routes with body and response examples', () => {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Recruitment').build(),
    );

    for (const operationDef of expectedOperations) {
      const pathItem = doc.paths[operationDef.path];
      expect(pathItem).toBeDefined();
      const operation = pathItem?.[operationDef.method];
      expect(operation).toBeDefined();

      if (operationDef.expectsBody) {
        const requestBody = operation?.requestBody as
          | {
              content?: Record<
                string,
                { examples?: unknown; example?: unknown; schema?: unknown }
              >;
            }
          | undefined;
        const media = requestBody?.content?.['application/json'];
        expect(media).toBeDefined();
        const requestExample =
          media?.examples ??
          media?.example ??
          (media?.schema as { example?: unknown } | undefined)?.example;
        if (requestExample === undefined) {
          throw new Error(
            `Missing request body example for ${operationDef.method.toUpperCase()} ${operationDef.path}`,
          );
        }
      }

      const successResponse = (operation?.responses?.['200'] ??
        operation?.responses?.['201']) as
        | {
            content?: Record<
              string,
              {
                schema?: { example?: unknown };
                example?: unknown;
              }
            >;
          }
        | undefined;

      const successJson = successResponse?.content?.['application/json'];
      expect(successJson).toBeDefined();
      const responseExample =
        successJson?.example ?? successJson?.schema?.example;
      expect(responseExample).toBeDefined();
    }
  });
});
