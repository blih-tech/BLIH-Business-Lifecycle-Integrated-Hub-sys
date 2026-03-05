import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { KeycloakAuthGuard } from '../../../shared/guards/keycloak-auth.guard';
import { RbacGuard } from '../../../shared/guards/rbac.guard';
import { JobsController } from './jobs.controller';
import { CandidatesController } from './candidates.controller';
import { JobApplicationsController } from './applications.controller';
import { InterviewsController } from './interviews.controller';
import {
  ApproveJobUseCase,
  CloseJobUseCase,
  CreateCandidateUseCase,
  CreateInterviewUseCase,
  CreateJobApplicationUseCase,
  CreateJobUseCase,
  GetCandidateUseCase,
  GetInterviewUseCase,
  GetJobApplicationUseCase,
  GetJobUseCase,
  ListCandidatesUseCase,
  ListInterviewsUseCase,
  ListJobApplicationsUseCase,
  ListJobsUseCase,
  PublishJobUseCase,
  SubmitJobUseCase,
  UpdateCandidateUseCase,
  UpdateInterviewUseCase,
  UpdateJobApplicationStatusUseCase,
  UpdateJobUseCase,
  UpsertJobResponsibilitiesUseCase,
  UpsertJobSkillsUseCase,
  UpsertJobToolsUseCase,
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
  CreateCandidateUseCase,
  ListCandidatesUseCase,
  GetCandidateUseCase,
  UpdateCandidateUseCase,
  CreateJobApplicationUseCase,
  ListJobApplicationsUseCase,
  GetJobApplicationUseCase,
  UpdateJobApplicationStatusUseCase,
  CreateInterviewUseCase,
  ListInterviewsUseCase,
  GetInterviewUseCase,
  UpdateInterviewUseCase,
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
  { path: '/hr/recruitment/candidates', method: 'post', expectsBody: true },
  { path: '/hr/recruitment/candidates', method: 'get', expectsBody: false },
  {
    path: '/hr/recruitment/candidates/{id}',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/candidates/{id}',
    method: 'patch',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/applications',
    method: 'post',
    expectsBody: true,
  },
  {
    path: '/hr/recruitment/applications',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/applications/{id}',
    method: 'get',
    expectsBody: false,
  },
  {
    path: '/hr/recruitment/applications/{id}/status',
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
        CandidatesController,
        JobApplicationsController,
        InterviewsController,
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

  it('documents all canonical recruitment routes with body and response examples', () => {
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
          | { content?: Record<string, { examples?: unknown }> }
          | undefined;
        const media = requestBody?.content?.['application/json'];
        expect(media).toBeDefined();
        expect(media?.examples).toBeDefined();
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
