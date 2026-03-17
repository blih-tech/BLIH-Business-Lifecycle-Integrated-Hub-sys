import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { BrainService } from './brain.service';
import { PrismaService } from '../../platform/prisma/prisma.service';

describe('BrainService', () => {
  let service: BrainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrainService,
        { provide: HttpService, useValue: { post: jest.fn() } },
        {
          provide: PrismaService,
          useValue: {
            applicant: { update: jest.fn(), findUnique: jest.fn() },
            job: { findUnique: jest.fn() },
            aiCvAnalysis: { create: jest.fn() },
            user: { findUnique: jest.fn() },
            performanceReview: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<BrainService>(BrainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
