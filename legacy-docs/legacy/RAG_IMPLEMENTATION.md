# BLIH RAG (Retrieval-Augmented Generation) Implementation

## Overview

RAG will enhance the BLIH AI Brain module by combining local LLM capabilities with intelligent document retrieval from the knowledge base, providing accurate, context-aware responses grounded in company data.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Query    │───▶│   Query Router   │───▶│  Vector Store   │
└─────────────────┘    └──────────────────┘    │    (Qdrant)     │
                              │                └─────────────────┘
                              ▼                         │
                       ┌──────────────┐                ▼
                       │  Hybrid      │        ┌─────────────────┐
                       │  Search      │        │ Document Store  │
                       │  Engine      │        │   (MongoDB)     │
                       └──────────────┘        └─────────────────┘
                              │                         │
                              ▼                         ▼
                       ┌──────────────┐        ┌─────────────────┐
                       │   Context    │◀───────│ Retrieved Docs  │
                       │  Builder     │        └─────────────────┘
                       └──────────────┘                │
                              ▼                         ▼
                       ┌──────────────┐        ┌─────────────────┐
                       │    LLM       │◀───────│  Prompt Template│
                       │ (Ollama)     │        └─────────────────┘
                       └──────────────┘                │
                              ▼                         ▼
                       ┌──────────────┐        ┌─────────────────┐
                       │   Response   │        │   Citation      │
                       │  Generator   │        │   Tracker       │
                       └──────────────┘        └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Final      │
                       │   Answer     │
                       └──────────────┘
```

## Core Components

### 1. Document Processing Pipeline

#### Ingestion Layer

- **Document Sources**: Internal documents, emails, chat logs, project files
- **Format Support**: PDF, DOCX, TXT, MD, HTML, JSON
- **Preprocessing**: Text extraction, cleaning, metadata extraction

#### Chunking Strategy

- **Semantic Chunking**: Use sentence embeddings to find natural break points
- **Size Optimization**: 512-1024 tokens per chunk for optimal retrieval
- **Overlap**: 20% overlap between chunks to maintain context
- **Metadata**: Source, author, date, department, tags

#### Vectorization

- **Embedding Model**: `all-MiniLM-L6-v2` (local, efficient)
- **Fallback**: OpenAI text-embedding-3-small (if needed)
- **Dimensions**: 384 vectors for balance of quality/performance
- **Batch Processing**: Efficient bulk embedding

### 2. Hybrid Search Engine

#### Vector Search (Primary)

- **Similarity Search**: Cosine similarity for semantic matching
- **Filters**: Metadata-based filtering (date, department, tags)
- **Reranking**: Cross-encoder for improved relevance

#### Keyword Search (Secondary)

- **Full-text Search**: MongoDB text indexes
- **Fuzzy Matching**: Handle typos and variations
- **Boosting**: Recent documents, authority sources

#### Fusion Algorithm

- **Reciprocal Rank Fusion (RRF)**: Combine vector and keyword results
- **Dynamic Weighting**: Adjust based on query type
- **Diversity**: Ensure result variety

### 3. Context Management

#### Context Window Optimization

- **Token Budgeting**: Allocate tokens for context vs. response
- **Relevance Filtering**: Only include highly relevant chunks
- **Compression**: Summarize long documents when needed

#### Conversation Memory

- **Session Context**: Maintain conversation history
- **Entity Tracking**: Remember key entities across turns
- **Context Refresh**: Update based on new information

### 4. LLM Integration

#### Model Strategy

- **Primary**: Local Llama 3 8B for privacy
- **Fallback**: OpenAI GPT-4 for complex queries
- **Specialized**: Fine-tuned models for specific domains

#### Prompt Engineering

- **System Prompts**: Role-specific instructions
- **Few-shot Examples**: Domain-specific examples
- **Chain of Thought**: Step-by-step reasoning
- **Citation Format**: Consistent source attribution

## Implementation Details

### Technology Stack

```typescript
// Core RAG Service
interface RAGService {
  query(request: QueryRequest): Promise<QueryResponse>;
  ingest(documents: Document[]): Promise<IngestResult>;
  update(documentId: string): Promise<UpdateResult>;
  delete(documentId: string): Promise<DeleteResult>;
}

// Vector Store Integration
interface VectorStore {
  upsert(vectors: Vector[]): Promise<void>;
  search(query: Vector, filters: Filter[]): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
}

// Document Store Integration
interface DocumentStore {
  store(document: Document): Promise<string>;
  retrieve(ids: string[]): Promise<Document[]>;
  update(id: string, document: Document): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Database Schema

#### MongoDB Documents Collection

```javascript
{
  _id: ObjectId,
  content: string,           // Full document content
  metadata: {
    title: string,
    source: string,
    author: string,
    department: string,
    createdAt: Date,
    updatedAt: Date,
    tags: [string],
    classification: string,  // public, internal, confidential
  },
  chunks: [{
    id: string,
    content: string,
    startChar: number,
    endChar: number,
    vectorId: string
  }],
  embeddings: {
    model: string,
    dimensions: number,
    generatedAt: Date
  }
}
```

#### Qdrant Vector Collection

```javascript
{
  id: string,              // Chunk ID
  vector: [float],         // 384 dimensions
  payload: {
    documentId: string,
    chunkIndex: number,
    content: string,
    metadata: object,
    createdAt: Date
  }
}
```

### API Endpoints

#### Query API

```typescript
POST /api/rag/query
{
  query: string,
  filters?: {
    department?: string,
    dateRange?: { start: Date, end: Date },
    tags?: string[],
    classification?: string
  },
  options?: {
    maxResults: number,
    includeSources: boolean,
    temperature: number,
    maxTokens: number
  }
}
```

#### Ingestion API

```typescript
POST /api/rag/ingest
{
  documents: [{
    content: string,
    metadata: {
      title: string,
      source: string,
      author: string,
      department: string,
      tags: string[],
      classification: string
    }
  }],
  options: {
    chunkSize: number,
    overlap: number,
    generateEmbeddings: boolean
  }
}
```

## Performance Optimization

### Caching Strategy

- **Query Cache**: Cache frequent queries with TTL
- **Embedding Cache**: Cache computed embeddings
- **Document Cache**: Cache retrieved documents
- **Response Cache**: Cache generated responses

### Indexing Strategy

- **Vector Index**: HNSW for fast approximate search
- **Text Index**: MongoDB compound indexes
- **Metadata Index**: Filter-based queries
- **Composite Index**: Multi-field searches

### Scaling Considerations

- **Horizontal Scaling**: Multiple Qdrant nodes
- **Load Balancing**: Query distribution
- **Batch Processing**: Efficient bulk operations
- **Resource Management**: Memory and CPU optimization

## Security & Privacy

### Data Protection

- **Encryption**: All data encrypted at rest and in transit
- **Access Control**: Role-based permissions
- **Audit Trail**: Complete query and access logging
- **Data Retention**: Configurable retention policies

### Privacy Features

- **Local Processing**: Sensitive data never leaves premises
- **Anonymization**: Remove personal identifiers when needed
- **Compliance**: GDPR and industry regulation compliant
- **Data Minimization**: Only store necessary information

## Monitoring & Analytics

### Performance Metrics

- **Query Latency**: End-to-end response time
- **Retrieval Quality**: Relevance scores and user feedback
- **System Health**: Resource usage and error rates
- **Usage Analytics**: Query patterns and popular content

### Quality Assurance

- **A/B Testing**: Compare different strategies
- **User Feedback**: Relevance ratings and corrections
- **Automated Testing**: Unit and integration tests
- **Continuous Improvement**: Model and system updates

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)

- Set up Qdrant vector store
- Implement document ingestion pipeline
- Create basic search functionality
- Develop API endpoints

### Phase 2: Enhancement (Weeks 5-8)

- Implement hybrid search
- Add context management
- Integrate with LLM
- Develop prompt templates

### Phase 3: Optimization (Weeks 9-12)

- Performance tuning
- Caching implementation
- Security hardening
- User interface integration

### Phase 4: Production (Weeks 13-16)

- Load testing
- Monitoring setup
- Documentation
- User training

## Success Metrics

### Technical Metrics

- **Query Response Time**: < 2 seconds
- **Retrieval Accuracy**: > 85% relevance
- **System Availability**: > 99.5%
- **Index Freshness**: < 5 minutes lag

### Business Metrics

- **User Adoption**: > 70% active usage
- **Query Success**: > 90% satisfactory responses
- **Knowledge Coverage**: > 80% of documents indexed
- **Support Reduction**: > 50% decrease in basic queries

## Future Enhancements

### Advanced Features

- **Multi-modal**: Image and video content
- **Real-time**: Live data integration
- **Collaborative**: Shared knowledge building
- **Personalization**: User-specific results

### AI Improvements

- **Fine-tuning**: Domain-specific models
- **Knowledge Graph**: Entity relationships
- **Reasoning**: Complex query handling
- **Generation**: Creative content creation
