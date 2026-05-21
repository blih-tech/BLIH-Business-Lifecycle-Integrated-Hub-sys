import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BrainService } from './brain.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BrainChatDto, ChatResponseDto } from './dto/chat.dto';
import { AnalyzeCvDto, CvAnalysisResponseDto } from './dto/analyze-cv.dto';
import {
  ScreenCandidatesDto,
  ScreenCandidatesResponseDto,
} from './dto/screen-candidate.dto';
import { UploadCvDto, UploadCvResponseDto } from './dto/upload-cv.dto';
import { PerformanceInsightsResponseDto } from './dto/performance-insight.dto';
import { ModuleType } from './enums/module.enum';

import {
  ApiEnvelopeOkResponse,
  ApiEnvelopeArrayResponse,
  ApiDefaultErrors,
} from '../../shared/docs/openapi';

import { KeycloakAuthGuard } from '../../shared/guards/keycloak-auth.guard';

@ApiTags('Brain')
@ApiBearerAuth()
@Controller('brain')
@UseGuards(KeycloakAuthGuard)
export class BrainController {
  constructor(private readonly brainService: BrainService) {}

  @Post('chat')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with brain',
    description:
      'Send a question to the AI assistant. Can optionally upload files (images, audio, PDFs) for context.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: BrainChatDto,
    description: 'Chat request with optional file upload',
    examples: {
      chatWithText: {
        summary: 'Simple text chat',
        value: {
          userId: 'user-123',
          question: 'What is our company policy on remote work?',
          module: ModuleType.HR,
        },
      },
      chatWithSession: {
        summary: 'Continue existing chat session',
        value: {
          userId: 'user-123',
          question: 'Can you elaborate on the approval process?',
          module: ModuleType.HR,
          sessionId: 'sess_123456789',
        },
      },
      chatWithFile: {
        summary: 'Chat with file upload (PDF, image, or audio)',
        value: {
          userId: 'user-123',
          question: 'Analyze this document',
          module: ModuleType.HR,
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    ChatResponseDto,
    'Chat response generated successfully',
    {
      success: true,
      message: 'Chat response generated successfully',
      data: {
        sessionId: 'sess_123456789',
        answer:
          'According to our company policy, remote work is allowed up to 3 days per week. Employees must coordinate with their managers and ensure core hours coverage from 10 AM to 3 PM.',
        sources: [
          {
            title: 'HR Policy Document - Remote Work Policy v2.3',
            relevance: 0.95,
            source: 'hr_policy_2025.pdf',
          },
          {
            title: 'Employee Handbook - Section 4',
            relevance: 0.87,
            source: 'employee_handbook.pdf',
          },
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_123456789',
        version: 'v1',
      },
    },
  )
  @ApiDefaultErrors({
    path: '/api/v1/brain/chat',
    badRequest:
      'Invalid request parameters. Check userId, question, or module fields.',
    unauthorized:
      'User not authenticated. Please provide valid authentication token.',
  })
  async chat(
    @Body() body: BrainChatDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ChatResponseDto> {
    return this.brainService.handleChat(
      body.userId,
      body.question,
      body.module,
      body.sessionId,
      file,
    );
  }

  @Get('sessions/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user chat sessions',
    description:
      'Retrieve all chat sessions for a user, optionally filtered by module',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user-123',
    required: true,
  })
  @ApiQuery({
    name: 'module',
    description: 'Filter sessions by module',
    enum: ModuleType,
    required: false,
    example: ModuleType.HR,
  })
  @ApiEnvelopeArrayResponse(Object, 'Sessions retrieved successfully', {
    success: true,
    message: 'Sessions retrieved successfully',
    data: [
      {
        id: 'sess_123456789',
        title: 'Remote work policy',
        module: 'hr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { messages: 5 },
      },
      {
        id: 'sess_987654321',
        title: 'Employee benefits',
        module: 'hr',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { messages: 3 },
      },
    ],
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'req_123456789',
      version: 'v1',
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/brain/sessions/:userId',
    notFound: 'User not found',
    unauthorized: 'User not authenticated',
  })
  async getSessions(
    @Param('userId') userId: string,
    @Query('module') module?: string,
  ) {
    return this.brainService.getUserChatSessions(userId, module as ModuleType);
  }

  @Get('history/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get chat history',
    description: 'Retrieve all messages from a specific chat session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Session ID',
    example: 'sess_123456789',
    required: true,
  })
  @ApiEnvelopeOkResponse(Object, 'Chat history retrieved successfully', {
    success: true,
    message: 'Chat history retrieved successfully',
    data: {
      id: 'sess_123456789',
      title: 'Remote work policy',
      module: 'hr',
      userId: 'user-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_1',
          role: 'user',
          content: 'What is the remote work policy?',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: 'Remote work is allowed up to 3 days per week...',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg_3',
          role: 'user',
          content: 'Can you elaborate on the approval process?',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg_4',
          role: 'assistant',
          content:
            'The approval process requires manager sign-off and HR notification...',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: 'req_123456789',
      version: 'v1',
    },
  })
  @ApiDefaultErrors({
    path: '/api/v1/brain/history/:sessionId',
    notFound: 'Chat session not found',
    unauthorized: 'User not authenticated',
  })
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.brainService.getChatHistory(sessionId);
  }

  @Post('analyze-cv')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze CV',
    description:
      'Analyze a candidate CV against a job description and get match score and recommendations',
  })
  @ApiBody({
    type: AnalyzeCvDto,
    examples: {
      analyzeCv: {
        summary: 'Analyze CV against job description',
        value: {
          applicantId: 'app_123456789',
          jobId: 'job_987654321',
          keycloakId: 'keycloak-user-123',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    CvAnalysisResponseDto,
    'CV analysis completed successfully',
    {
      success: true,
      message: 'CV analysis completed successfully',
      data: {
        score: 85,
        recommendation: 'RECOMMEND',
        strengths: [
          'Strong technical skills in React and TypeScript',
          '6 years of relevant experience',
          'Previous experience in similar industry',
        ],
        weaknesses: [
          'Limited leadership experience',
          'Gap in employment from 2022-2023',
          'No cloud certification',
        ],
        summary:
          'Candidate shows strong alignment with technical requirements. The 6 years of frontend development experience with React matches the job requirements well. However, the candidate lacks leadership experience which may be needed for the senior position. Recommended for interview to assess soft skills and cultural fit.',
        confidence: 0.92,
        modelVersion: 'v2.1.0',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_123456789',
        version: 'v1',
      },
    },
  )
  @ApiDefaultErrors({
    path: '/api/v1/brain/analyze-cv',
    badRequest:
      'Invalid applicant or job ID. Ensure both IDs exist in the system.',
    notFound: 'Applicant or job not found. Please verify the IDs.',
    unauthorized: 'User not authenticated',
  })
  async analyzeCv(@Body() body: AnalyzeCvDto): Promise<CvAnalysisResponseDto> {
    return this.brainService.runCvAnalysis(
      body.applicantId,
      body.jobId,
      body.keycloakId,
    );
  }

  @Get('insights/performance/:employeeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get employee performance insights',
    description:
      'Get AI-generated insights and recommendations for employee performance based on performance reviews and feedback',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: 'emp_123456789',
    required: true,
  })
  @ApiEnvelopeOkResponse(
    PerformanceInsightsResponseDto,
    'Performance insights retrieved successfully',
    {
      success: true,
      message: 'Performance insights retrieved successfully',
      data: {
        employeeId: 'emp_123456789',
        insights: [
          'Consistently exceeds technical targets, delivering 120% of expected output',
          'Strong collaboration with cross-functional teams, particularly with product and QA',
          'Excellent code quality with 98% test coverage',
          'Proactively mentors junior developers, conducting weekly knowledge sharing sessions',
        ],
        recommendations: [
          'Consider leadership training program to prepare for team lead role',
          'Opportunity to mentor junior developers more formally',
          'Suggest presenting at upcoming company tech conference',
          'Consider involvement in architectural decision making',
        ],
        createdAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_123456789',
        version: 'v1',
      },
    },
  )
  @ApiDefaultErrors({
    path: '/api/v1/brain/insights/performance/:employeeId',
    notFound: 'Employee not found. Please verify the employee ID.',
    unauthorized: 'User not authenticated',
  })
  async getPerformanceInsights(
    @Param('employeeId') employeeId: string,
  ): Promise<PerformanceInsightsResponseDto> {
    return this.brainService.getEmployeeInsights(employeeId);
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upload CV',
    description:
      'Upload a CV file for a candidate. Will automatically analyze and score against the job description if possible.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadCvDto,
    examples: {
      uploadCvWithAutoScreen: {
        summary: 'Upload CV with auto-screening',
        value: {
          applicantId: 'app_123456789',
          jobId: 'job_987654321',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    UploadCvResponseDto,
    'CV uploaded and processed successfully',
    {
      success: true,
      message: 'CV uploaded and processed successfully',
      data: {
        applicantId: 'app_123456789',
        score: 85,
        recommendation: 'RECOMMEND',
        status: 'Success: CV Uploaded and AI Screened',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_123456789',
        version: 'v1',
      },
    },
  )
  @ApiDefaultErrors({
    path: '/api/v1/brain/upload-cv',
    badRequest:
      'Invalid file or missing required fields. Supported formats: PDF, DOC, DOCX, TXT',
    unauthorized: 'User not authenticated',
  })
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @Body('applicantId') applicantId: string,
    @Body('jobId') jobId: string,
    @Request() req: { user?: { sub?: string } },
  ): Promise<UploadCvResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'CV file is required. Supported formats: PDF, DOC, DOCX, TXT',
      );
    }

    const keycloakId = req?.user?.sub ?? 'ai-system';
    return this.brainService.processCvUpload(
      file.buffer,
      applicantId,
      jobId,
      keycloakId,
    );
  }

  @Post('screen-candidates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Screen candidates for job',
    description:
      'Screen all candidates for a specific job and get ranked recommendations based on CV analysis',
  })
  @ApiBody({
    type: ScreenCandidatesDto,
    examples: {
      screenCandidates: {
        summary: 'Screen all candidates for a job',
        value: {
          jobId: 'job_987654321',
        },
      },
    },
  })
  @ApiEnvelopeOkResponse(
    ScreenCandidatesResponseDto,
    'Candidates screened successfully',
    {
      success: true,
      message: 'Candidates screened successfully',
      data: {
        totalApplicants: 25,
        rankedApplicants: [
          {
            candidateId: 'app_001',
            score: 92,
            recommendation: 'STRONG_RECOMMEND',
          },
          {
            candidateId: 'app_002',
            score: 85,
            recommendation: 'RECOMMEND',
          },
          {
            candidateId: 'app_003',
            score: 78,
            recommendation: 'CONSIDER',
          },
          {
            candidateId: 'app_004',
            score: 45,
            recommendation: 'REJECT',
          },
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: 'req_123456789',
        version: 'v1',
      },
    },
  )
  @ApiDefaultErrors({
    path: '/api/v1/brain/screen-candidates',
    badRequest: 'Invalid job ID. Please provide a valid job UUID.',
    notFound: 'Job not found. Please verify the job ID exists.',
    unauthorized: 'User not authenticated',
  })
  async screenCandidates(
    @Body() body: ScreenCandidatesDto,
    @Request() req: { user?: { sub?: string } },
  ): Promise<ScreenCandidatesResponseDto> {
    const keycloakId = req?.user?.sub ?? 'ai-system';
    return this.brainService.screenCandidatesForJob(body.jobId, keycloakId);
  }
}
