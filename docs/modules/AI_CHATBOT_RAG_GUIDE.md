# AI Chatbot & RAG Specification

**Module:** Brain (AI)  
**Component:** Conversational Interface & RAG Engine  
**Version:** 1.1  
**Last Updated:** February 2026

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [RAG Pipeline Implementation](#2-rag-pipeline-implementation)
3. [Database Schema & Storage](#3-database-schema--storage)
4. [API Endpoints](#4-api-endpoints)
5. [Frontend Integration](#5-frontend-integration)
6. [Prompt Engineering](#6-prompt-engineering)
7. [Evaluation & Observability](#7-evaluation--observability)
8. [Configuration Reference](#8-configuration-reference)

---

## 1. Architectural Overview

The BLIH AI Module implements an advanced Retrieval-Augmented Generation (RAG) architecture designed for high-accuracy enterprise knowledge retrieval. It decouples the reasoning engine (LLM) from the knowledge base (Vector DB), ensuring data freshness and reducing hallucinations.

### 1.1 High-Level Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   Client App    │ <---> │   Orchestrator   │ <---> │    LLM API      │
│ (React/Next.js) │  WS   │  (Node/Python)   │ HTTPS │ (Ollama/OpenAI) │
└─────────────────┘       └────────┬─────────┘       └─────────────────┘
                                   │
                          ┌────────┴────────┐
                          │    Vector Store │
                          │     (Qdrant)    │
                          └─────────────────┘
```

### 1.2 Core Components

| Component           | Technology         | Purpose                                               |
| ------------------- | ------------------ | ----------------------------------------------------- |
| **Orchestrator**    | NestJS / LangChain | Manages chat state, tools, and retrieval logic        |
| **Vector DB**       | Qdrant             | Stores document embeddings for semantic search        |
| **Embedding Model** | `all-MiniLM-L6-v2` | Converts text chunks into 384-dimensional vectors     |
| **LLM Inference**   | Ollama (`llama3`)  | Generates human-like responses from retrieved context |
| **Document Loader** | Unstructured.io    | Ingests PDF, DOCX, MD, and HTML files                 |

---

## 2. RAG Pipeline Implementation

### 2.1 Ingestion Pipeline

The ingestion process runs asynchronously to prevent blocking the UI.

1. **Extraction:** Documents are parsed using `Unstructured` to extract text, tables, and metadata.
2. **Chunking:** Text is split using a **Recursive Character Splitter**.
   - **Chunk Size:** 512 tokens
   - **Overlap:** 50 tokens
   - **Separators:** `["\n\n", "\n", " ", ""]`
3. **Embedding:** Chunks are passed through the embedding model.
4. **Indexing:** Vectors are upserted to Qdrant with payload metadata (doc_id, access_level, company_id).

### 2.2 Retrieval Strategy

We employ a **Hybrid Search** strategy with **Re-ranking** for maximum relevance.

**Step 1: Hybrid Retrieval (Keyword + Semantic)**

```typescript
const vectorResults = await qdrant.search({
  vector: queryEmbedding,
  limit: 50,
});

const keywordResults = await pg.keywordSearch({
  query: userQuery,
  limit: 50,
});

const merged = deduplicate([...vectorResults, ...keywordResults]);
```

**Step 2: Cross-Encoder Re-ranking**
The top 50 candidates are scored against the user query using a Cross-Encoder (`ms-marco-MiniLM-L-6-v2`). This reranker inputs `(Query, Document)` pairs and outputs a similarity score (0-1).

**Step 3: Context Window Selection**
Select the top $N$ chunks that fit within the LLM's context window (e.g., 4096 tokens), reserving space for the system prompt and response.

---

## 3. Database Schema & Storage

### 3.1 PostgreSQL Schema

Stores chat sessions, message history, and document metadata. The actual vector data resides in Qdrant.

```sql
-- Chat Sessions
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    summary TEXT, -- Auto-generated summary of conversation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Stores preferences, active tools
);

-- Chat Messages
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Citations (Sources)
CREATE TABLE ai_message_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id),
    chunk_index INT NOT NULL,
    score FLOAT, -- Relevance score (0-1)
    text_snippet TEXT
);
```

### 3.2 Qdrant Collection Config

```json
{
  "name": "corporate_knowledge",
  "vectors": {
    "size": 384,
    "distance": "Cosine"
  },
  "optimizers_config": {
    "default_segment_number": 2
  },
  "replication_factor": 2
}
```

---

## 4. API Endpoints

### 4.1 Chat Completion (Streaming)

**POST** `/api/v1/brain/chat`

**Request:**

```json
{
  "session_id": "uuid",
  "message": "What is the policy on remote work?",
  "temperature": 0.7,
  "stream": true,
  "filters": {
    "document_ids": ["uuid1", "uuid2"] // Optional: focused chat
  }
}
```

**Response (SSE Stream):**

```text
data: {"event": "start", "message_id": "msg_123"}
data: {"event": "citation", "citation": {"doc_id": "d1", "snippet": "..."}}
data: {"event": "token", "content": "The"}
data: {"event": "token", "content": " policy"}
...
data: {"event": "done", "tokens_used": 150}
```

### 4.2 Feedback Loop

**POST** `/api/v1/brain/messages/:id/feedback`

Users can rate responses to improve the RAG performance.

**Request:**

```json
{
  "rating": "positive", // 'positive' | 'negative'
  "comment": "Accurate citation",
  "corrected_answer": "..." // Optional handling for manual correction
}
```

---

## 5. Frontend Integration

### 5.1 React Custom Hook (`useChat`)

We provide a custom hook to manage WebSocket/SSE connections and state.

```typescript
const { messages, sendMessage, isLoading, stopGeneration } = useChat({
  api: '/api/v1/brain/chat',
  initialMessages: [],
  onFinish: (message) => console.log('Chat finished', message),
});
```

### 5.2 UI Components

- **`<ChatWidget />`**: Floating button used globally.
- **`<SourceSidebar />`**: Displays PDF/Doc viewer focused on the cited page.
- **`<CitationCard />`**: Renders a pill-badge `[1]` that toggles the sidebar.

**Snippet: Rendering Citations**

```jsx
const renderMessage = (content, citations) => {
  // Regex to replace [1] with interactive component
  return content.replace(/\[(\d+)\]/g, (match, id) => (
    <CitationBadge
      citation={citations[id]}
      onClick={() => openSource(citations[id])}
    />
  ));
};
```

---

## 6. Prompt Engineering

### 6.1 System Persona

```text
You are BLIH-AI, an intelligent enterprise assistant.
Your goal is to provide accurate, helpful, and concise answers based strictly on the provided context.

GUIDELINES:
1. **Accuracy**: Only use information from the Context. If the answer is not there, say "I don't have that information."
2. **Citations**: Cite your sources using square brackets like [1].
3. **Tone**: Professional, encouraging, and direct.
4. **Formatting**: Use Markdown for lists, code blocks, and headers.

CONTEXT:
{{retrieved_chunks}}

USER QUERY:
{{user_query}}
```

### 6.2 Query Rewriting

To handle multi-turn conversations, we first rewrite the user's latest query to include context from previous turns.

**Prompt:**

```text
Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone query.

History:
User: "What is the vacation policy?"
AI: "You get 20 days per year."

Follow-up: "Does it roll over?"

**Standalone Query:** "Does the 20-day annual vacation policy allow rollover of unused days?"
```

---

## 7. Evaluation & Observability

We use **LangSmith** or **Arize Phoenix** for tracing and evaluation.

### 7.1 Key Metrics

- **Faithfulness:** Does the answer hallucinate information not in the context?
- **Answer Relevance:** Does the answer address the user's query?
- **Context Recalls:** Did retrieval find the ground-truth document?
- **Latency:** Time-to-first-token (TTFT) and Total End-to-End Latency.

### 7.2 Feedback Dashboard

Admin panel to review negative feedback:

1. View the User Query.
2. View Retrieved Chunks.
3. View AI Response.
4. Action: **Tune Retrieval** (boost specific docs) or **Edit Source** (fix the document).

---

## 8. Configuration Reference

**`ai-service.config.yaml`**

```yaml
rag:
  chunk_size: 512
  chunk_overlap: 50
  retrieval_k: 5
  rerank: true

models:
  llm:
    provider: 'ollama'
    model: 'llama3'
    temperature: 0.2
    context_window: 8192
  embedding:
    provider: 'huggingface'
    model: 'all-MiniLM-L6-v2'

vector_db:
  host: 'qdrant'
  port: 6333
  collection: 'blih_knowledge'

rate_limiting:
  requests_per_min: 60
  daily_token_limit: 100000
```
