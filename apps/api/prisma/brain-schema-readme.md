# Brain/AI Schema Integration

## Overview

The Brain/AI module has been integrated into the main Prisma schema to provide AI-powered functionality for the BLIH system. This integration includes document processing, chat systems, CV analysis, performance insights, and training recommendations.

## Schema Structure

### Location

- **Main Schema**: `prisma/schema.prisma` (contains all models including AI)
- **Brain Reference**: `prisma/brain.schema.prisma` (for reference and development)

### AI Models Added

#### 1. Document Management

- `AiDocument` - Store uploaded documents with metadata
- `AiChunk` - Document chunks for vector storage and retrieval

#### 2. Chat System

- `AiChatSession` - User chat sessions with AI
- `AiChatMessage` - Individual messages within sessions

#### 3. AI Analysis

- `AiCvAnalysis` - AI analysis of candidate CVs against jobs
- `AiExtractedSkill` - Skills extracted from candidate documents
- `AiPerformanceInsight` - AI-generated performance insights
- `AiTrainingRecommendation` - AI training recommendations

#### 4. Logging & Knowledge

- `AiDecisionLog` - Audit trail for AI decisions
- `BrainKnowledgeSource` - Knowledge source tracking

#### 5. Enums

- `ScreeningRecommendation` - CV analysis recommendation levels

## Integration Points

### Cross-Module Relations

The AI models integrate with existing HR modules:

- **User Model**: `aiDocuments`, `aiChatSessions`
- **Employee Model**: `aiPerformanceInsights`, `aiTrainingRecommendations`
- **Candidate Model**: `aiCvAnalyses`, `aiExtractedSkills`
- **Job Model**: `aiCvAnalyses`
- **Skill Model**: `aiExtractedSkills`
- **PerformanceReview Model**: `aiPerformanceInsights`

## Usage

### Generating Prisma Client

```bash
npm run prisma:generate
```

### Validating Schema

```bash
npm run prisma:brain:validate
```

### Formatting Schema

```bash
npm run prisma:brain:format
```

### Running Migrations

```bash
npm run prisma:migrate:dev
```

## Key Features

### 1. Document Processing

- Upload and process documents for AI analysis
- Chunk documents for vector storage
- Integration with Qdrant vector database

### 2. AI Chat System

- User-specific chat sessions
- Module-based conversation organization
- Token usage tracking

### 3. Recruitment AI

- CV analysis against job requirements
- Skill extraction and matching
- Recommendation scoring

### 4. Performance AI

- AI-generated performance insights
- Training recommendations
- Review-based analysis

### 5. Audit Trail

- Complete logging of AI decisions
- Reference tracking for transparency
- Timestamped decision records

## Database Indexes

All AI models include strategic indexes for performance:

- Module-based queries
- User/Employee lookups
- Time-based queries
- Reference-based searches

## Future Enhancements

### Planned Features

- Advanced sentiment analysis
- Multi-language support
- Real-time processing
- Custom AI models

### Integration Points

- External AI services
- Advanced vector databases
- Machine learning pipelines
- Analytics dashboards

## Development Guidelines

### Adding New AI Models

1. Define model in brain.schema.prisma reference
2. Add to main schema.prisma
3. Update relations in existing models
4. Add appropriate indexes
5. Generate and validate schema

### Testing

```bash
# Validate schema syntax
npm run prisma:brain:validate

# Test client generation
npm run prisma:generate

# Format schema files
npm run prisma:brain:format
```

## Security Considerations

- All AI decisions are logged for audit
- User data isolation through proper relations
- Cascade deletes for data cleanup
- Proper indexing for performance

## Performance Notes

- Strategic indexing on frequently queried fields
- JSON fields for flexible AI data storage
- UUID primary keys for distributed systems
- Proper foreign key constraints for data integrity
