# Brain (AI) Integration Guide

**Module:** AI & Knowledge Management  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Integration Overview](#1-integration-overview)
2. [Document Processing](#2-document-processing)
3. [External AI Services](#3-external-ai-services)
4. [Knowledge Base Import](#4-knowledge-base-import)
5. [Vector Database](#5-vector-database)
6. [Workflow Automation](#6-workflow-automation)

---

## 1. Integration Overview

### 1.1 Supported Integrations

| Integration | Provider | Protocol | Use Case | Status |
|-------------|----------|----------|----------|--------|
| **LLM** | Ollama (local), OpenAI | REST API | AI chat, RAG | ✅ Active |
| **Document OCR** | Tesseract, AWS Textract | API | PDF/Image extraction | ✅ Active |
| **Vector DB** | Qdrant (primary), Pinecone | gRPC/REST | Embeddings storage | ✅ Active |
| **Knowledge** | Confluence, Notion | REST API | Knowledge import | 🚧 Beta |
| **Speech-to-Text** | Whisper, Google Speech | API | Meeting transcription | 🚧 Beta |

### 1.2 Integration Architecture

```
┌───────────────────────────────────────────────┐
│  BLIH Brain Module                            │
├───────────────────────────────────────────────┤
│  AI Pipeline                                  │
│  ├─ Document Processor (Tesseract/Textract)  │
│  ├─ Embedding Generator (sentence-transformers) │
│  ├─ Vector Store (Qdrant)                    │
│  ├─ LLM Interface (Ollama/OpenAI)            │
│  └─ RAG Orchestrator                         │
└───────────────────────────────────────────────┘
         ↓                    ↓                  ↓
    [Ollama]           [Qdrant]          [AWS Textract]
```

---

## 2. Document Processing

### 2.1 Tesseract OCR (Open Source)

**For scanned PDFs and images**

**Setup:**
```bash
# Install Tesseract
apt-get install tesseract-ocr
apt-get install tesseract-ocr-amh  # Amharic language pack

# Environment
TESSERACT_PATH=/usr/bin/tesseract
TESSERACT_LANGUAGES=eng,amh
```

**API Usage:**
```http
POST /api/v1/brain/documents/ocr
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Scanned PDF or image
- `language`: `eng`, `amh`, or `auto`

**Response:**
```json
{
  "text": "Extracted text from the document...",
  "confidence": 0.95,
  "language_detected": "eng",
  "processing_time_ms": 2500,
  "pages_processed": 5
}
```

### 2.2 AWS Textract (Cloud)

**For complex documents (tables, forms)**

**Setup:**
```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

**Features:**
- ✅ Table extraction
- ✅ Form field detection
- ✅ Handwriting recognition
- ✅ Multi-language support

**API Usage:**
```http
POST /api/v1/brain/documents/ocr-advanced
```

**Request:**
```json
{
  "document_url": "https://s3.amazonaws.com/bucket/document.pdf",
  "features": ["TABLES", "FORMS"],
  "language": "auto"
}
```

**Response:**
```json
{
  "text": "Full text extraction...",
  "tables": [
    {
      "rows": 10,
      "columns": 5,
      "data": [[...]]
    }
  ],
  "forms": [
    {
      "key": "Employee Name",
      "value": "John Doe",
      "confidence": 0.98
    }
  ]
}
```

### 2.3 Document Chunking Strategy

**Intelligent chunking for RAG:**
```json
{
  "chunking_strategy": {
    "method": "semantic",  // or "fixed_size", "paragraph"
    "chunk_size": 512,
    "chunk_overlap": 50,
    "respect_boundaries": ["paragraph", "section"],
    "metadata_preservation": true
  }
}
```

**Example:**
```typescript
// Document → Chunks
const chunks = await chunkDocument({
  text: documentText,
  metadata: {
    source: "Employee_Handbook.pdf",
    page: 15,
    section: "Remote Work Policy"
  }
});

// Each chunk stored with context
{
  "chunk_id": "chunk_abc123",
  "text": "Remote work is permitted...",
  "metadata": {
    "source": "Employee_Handbook.pdf",
    "page": 15,
    "section": "Remote Work Policy",
    "previous_chunk": "chunk_abc122",
    "next_chunk": "chunk_abc124"
  }
}
```

---

## 3. External AI Services

### 3.1 Ollama (Primary - Local)

**Self-hosted LLM**

**Setup:**
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull models
ollama pull llama3.2:3b
ollama pull mistral:7b
ollama pull codellama:13b

# Environment
OLLAMA_HOST=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:3b
```

**Model Selection:**
```typescript
// Model routing based on task
const modelSelection = {
  'general_chat': 'llama3.2:3b',      // Fast, general purpose
  'technical_docs': 'mistral:7b',      // Better for technical content
  'code_generation': 'codellama:13b',  // Code-specific
  'summarization': 'llama3.2:3b'       // Fast summaries
};
```

**API Usage:**
```http
POST /api/v1/brain/ai/generate
```

**Request:**
```json
{
  "prompt": "Summarize the employee handbook",
  "model": "llama3.2:3b",
  "max_tokens": 500,
  "temperature": 0.7,
  "stream": false
}
```

### 3.2 OpenAI API (Optional - Cloud)

**For advanced capabilities**

**Setup:**
```bash
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
OPENAI_DEFAULT_MODEL=gpt-4-turbo
```

**Use Cases:**
- Complex reasoning tasks
- Code generation
- High-quality summarization
- Multi-modal (vision + text)

**Cost Control:**
```json
{
  "openai_limits": {
    "max_tokens_per_request": 2000,
    "max_requests_per_day": 1000,
    "budget_limit_usd": 100.00
  }
}
```

### 3.3 Hybrid Approach

**Best of both worlds:**
```typescript
async function selectModel(task: string, complexity: string) {
  // Use Ollama for simple tasks (free)
  if (complexity === 'low') {
    return 'ollama:llama3.2:3b';
  }
  
  // Use OpenAI for complex tasks (paid, higher quality)
  if (complexity === 'high' && budget.hasRemaining()) {
    return 'openai:gpt-4-turbo';
  }
  
  // Fallback to Ollama
  return 'ollama:mistral:7b';
}
```

---

## 4. Knowledge Base Import

### 4.1 Confluence Integration

**OAuth 2.0 Setup:**
```bash
CONFLUENCE_DOMAIN=yourcompany.atlassian.net
CONFLUENCE_USER_EMAIL=admin@yourcompany.com
CONFLUENCE_API_TOKEN=your_api_token
```

**Import Confluence Space:**
```http
POST /api/v1/brain/import/confluence
```

**Request:**
```json
{
  "space_key": "ENG",
  "recursive": true,
  "include_attachments": true,
  "sync_mode": "initial"  // or "incremental"
}
```

**Response:**
```json
{
  "job_id": "import_job_123",
  "pages_found": 150,
  "status": "PROCESSING",
  "estimated_time_minutes": 5
}
```

**Sync Schedule:**
```json
{
  "confluence_sync": {
    "enabled": true,
    "frequency": "daily",
    "time": "02:00",  // 2 AM
    "spaces": ["ENG", "HR", "SALES"]
  }
}
```

### 4.2 Notion Integration

**API Key Setup:**
```bash
NOTION_API_KEY=secret_...
NOTION_VERSION=2022-06-28
```

**Import Database:**
```http
POST /api/v1/brain/import/notion
```

**Request:**
```json
{
  "database_id": "abc123...",
  "filter": {
    "property": "Status",
    "select": { "equals": "Published" }
  }
}
```

### 4.3 SharePoint/OneDrive

**Microsoft Graph API:**
```bash
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
```

**Import Documents:**
```http
POST /api/v1/brain/import/sharepoint
```

**Request:**
```json
{
  "site_id": "yourcompany.sharepoint.com,abc123",
  "folder_path": "/Shared Documents/Policies",
  "file_types": ["pdf", "docx", "pptx"]
}
```

---

## 5. Vector Database

### 5.1 Qdrant (Primary)

**Self-hosted vector database**

**Setup:**
```bash
# Docker Compose
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qd rant_storage:/qdrant/storage

# Environment
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=your_api_key
```

**Collection Per Company:**
```typescript
// Create collection for new company
POST /api/v1/brain/vector/collections

{
  "name": "company_BLIH",
  "vectors": {
    "size": 384,  // sentence-transformers/all-MiniLM-L6-v2
    "distance": "Cosine"
  },
  "optimizers_config": {
    "default_segment_number": 2
  }
}
```

**Index Document:**
```typescript
// After processing document
POST /qdrant/collections/company_BLIH/points

{
  "points": [
    {
      "id": "chunk_abc123",
      "vector": [0.123, 0.456, ...],  // 384 dimensions
      "payload": {
        "document_id": "doc_xyz789",
        "text": "Remote work is permitted...",
        "page": 15,
        "classification": "INTERNAL"
      }
    }
  ]
}
```

### 5.2 Pinecone (Cloud Alternative)

**Managed vector database**

**Setup:**
```bash
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=blih-knowledge
```

**Features:**
- Serverless (auto-scaling)
- Global distribution
- Built-in monitoring

---

## 6. Workflow Automation

### 6.1 Zapier Integration

**Trigger BLIH AI from 5000+ apps**

**Setup:**
```http
POST /api/v1/integrations/zapier/webhook
```

**Example Zaps:**

**1. Gmail → BLIH Knowledge Base**
```
Trigger: New email with label "Knowledge"
Action: Upload to BLIH, extract & index
```

**2. Slack → BLIH AI Chat**
```
Trigger: Mention @BLIH in Slack
Action: Query BLIH AI, post response
```

**3. Google Drive → BLIH**
```
Trigger: New file in "Company Docs" folder
Action: Upload & index in BLIH
```

### 6.2 Make.com (Integromat)

**Visual workflow builder**

**Example Scenario:**
```
1. Watch Google Docs folder
2. Download new document
3. Send to BLIH OCR
4. Index in knowledge base
5. Notify Slack channel
```

### 6.3 Custom Webhooks

**Real-Time Notifications:**
```http
POST /api/v1/brain/webhooks
```

**Request:**
```json
{
  "url": "https://your-app.com/webhook/brain",
  "events": [
    "document.indexed",
    "rag.query.completed",
    "decision.created"
  ]
}
```

**Webhook Payload:**
```json
{
  "event": "document.indexed",
  "timestamp": "2026-02-10T14:00:00Z",
  "data": {
    "document_id": "doc_abc123",
    "title": "Q1 2026 Strategy",
    "chunks_created": 45,
    "classification": "CONFIDENTIAL"
  }
}
```

---

## Embedding Models

### Local Embedding Generation

**sentence-transformers (Recommended):**
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings
embeddings = model.encode([
    "Remote work policy document",
    "Employee benefits handbook"
])

# Shape: (2, 384)
```

**Model Options:**
| Model | Dimensions | Speed | Quality |
|-------|------------|-------|---------|
| `all-MiniLM-L6-v2` | 384 | ⚡⚡⚡ | ⭐⭐ |
| `all-mpnet-base-v2` | 768 | ⚡⚡ | ⭐⭐⭐ |
| `multi-qa-mpnet-base` | 768 | ⚡⚡ | ⭐⭐⭐ (Best for Q&A) |

### OpenAI Embeddings (Cloud)

**For higher quality:**
```http
POST https://api.openai.com/v1/embeddings
{
  "model": "text-embedding-3-small",
  "input": "Your text here"
}
```

**Dimensions:** 1536 (higher quality, more expensive)

---

## Troubleshooting

### Ollama Connection Issues

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
systemctl restart ollama

# View logs
journalctl -u ollama -f
```

### Vector Search Not Working

```bash
# Check Qdrant health
curl http://localhost:6333/

# Rebuild index
POST /api/v1/brain/vector/rebuild
{
  "collection": "company_BLIH"
}
```

### Document Processing Stuck

```bash
# Check processing queue
GET /api/v1/brain/documents/queue

# Retry failed jobs
POST /api/v1/brain/documents/retry-failed
```

---

**Related Documentation:**
- [BRAIN_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/BRAIN_API.md) - AI API reference
- [BRAIN_SECURITY.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/BRAIN_SECURITY.md) - AI security
- [MODULE_BRAIN.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_BRAIN.md) - Features

**Last Updated:** February 2026
