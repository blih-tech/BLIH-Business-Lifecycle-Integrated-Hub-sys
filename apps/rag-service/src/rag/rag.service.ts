import { Injectable, Logger } from '@nestjs/common';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';

interface CvAnalysisResult {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: 'STRONG_RECOMMEND' | 'RECOMMEND' | 'CONSIDER' | 'REJECT';
  summary?: string;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private llm: ChatOllama;
  private embeddings: OllamaEmbeddings;
  private readonly qdrantUrl = process.env.QDRANT_URL;
  private readonly collectionName = 'company_knowledge';

  constructor() {
    this.llm = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: 'llama3.2',
      numPredict: 1024,
      temperature: 0.1,
    });

    this.embeddings = new OllamaEmbeddings({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: 'nomic-embed-text',
    });
  }

  private extractAnswer(response: unknown): string {
    if (response && typeof response === 'object' && 'content' in response) {
      const content = (response as { content: unknown }).content;
      if (typeof content === 'string') {
        return content;
      }
    }
    this.logger.warn('Unexpected Ollama response format - using empty string');
    return '';
  }

  async clearCollection() {
    try {
      await fetch(`${this.qdrantUrl}/collections/${this.collectionName}`, {
        method: 'DELETE',
      });
      console.log('Database cleared for fresh sync.');
      return { message: 'Collection deleted successfully' };
    } catch {
      console.log(
        'Collection did not exist or could not be deleted. Skipping.',
      );
      return { message: 'No collection to delete' };
    }
  }

  async ingest(
    text: string,
    source: string,
    metadata?: Record<string, unknown>,
  ) {
    const safeMetadata = {
      module:
        typeof metadata?.module === 'string' ? metadata.module : 'general',

      userId:
        typeof metadata?.userId === 'string' ? metadata.userId : undefined,

      type: typeof metadata?.type === 'string' ? metadata.type : 'document',

      tags: Array.isArray(metadata?.tags) ? metadata.tags : [],
    };

    return this.ingestToBrain(text, source, safeMetadata);
  }

  async ingestToBrain(
    content: string,
    source: string,
    metadata: {
      module: string;
      userId?: string;
      type: string;
      tags?: string[];
    },
  ) {
    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.replace(/"/g, '') : v,
      ]),
    );
    const doc = new Document({
      pageContent: content,
      metadata: {
        ...cleanMetadata,
        source,
        date_ingested: new Date().toISOString(),
      },
    });
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments([doc]);

    await QdrantVectorStore.fromDocuments(splitDocs, this.embeddings, {
      url: this.qdrantUrl,
      collectionName: this.collectionName,
    });

    return { message: `Successfully ingested ${splitDocs.length} chunks.` };
  }

  async processPDF(
    fileBuffer: Buffer,
    fileName: string,
    metadata?: Record<string, any>,
  ) {
    const blob = new Blob([new Uint8Array(fileBuffer)], {
      type: 'application/pdf',
    });

    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docsWithMetadata: Document[] = docs.map(
      (d): Document => ({
        pageContent: d.pageContent,
        metadata: {
          ...(d.metadata as Record<string, unknown>),
          ...(metadata ?? {}),
          source: fileName,
        },
      }),
    );

    const splitDocs = await splitter.splitDocuments(docsWithMetadata);

    for (const doc of splitDocs) {
      await this.ingestToBrain(doc.pageContent, fileName, {
        module:
          typeof metadata?.module === 'string' ? metadata.module : 'general',

        userId:
          typeof metadata?.userId === 'string' ? metadata.userId : undefined,

        type: typeof metadata?.type === 'string' ? metadata.type : 'document',

        tags: Array.isArray(metadata?.tags) ? metadata.tags : [],
      });
    }

    return {
      message: `Successfully processed ${splitDocs.length} chunks or ${fileName}.`,
    };
  }

  async analyzeImage(fileBuffer: Buffer): Promise<{ description: string }> {
    const base64Image = fileBuffer.toString('base64');

    const visionModel = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: 'llava:7b',
    });

    const response = (await visionModel.invoke([
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Describe this image for a corporate knowledge base. Focus on text, charts, or professional context.',
          },
          {
            type: 'image_url',
            image_url: `data:image/jpeg;base64,${base64Image}`,
          },
        ],
      },
    ])) as { content: string };

    return { description: String(response.content) };
  }
  transcribeAudio(fileBuffer: Buffer): Promise<{ text: string }> {
    this.logger.warn(
      `Audio transcription called (Buffer size: ${fileBuffer.length}) - ensure Whisper service is configured.`,
    );

    return Promise.resolve({
      text: 'Audio transcription placeholder: User mentioned a task update.',
    });
  }

  async askQuestion(
    question: string,
    history: { role: string; content: string }[] = [],
    filter: Record<string, unknown> = {},
  ) {
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      this.embeddings,
      {
        url: this.qdrantUrl,
        collectionName: this.collectionName,
      },
    );

    console.log('Final Search Filter:', filter);

    const relevantDocs = await vectorStore.similaritySearch(
      question,
      3,
      filter,
    );

    const context = relevantDocs.map((d) => d.pageContent).join('\n\n');

    const chatHistoryString = history
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`,
      )
      .join('\n');

    console.log(
      'Documents found:',
      relevantDocs.map((d) => d.pageContent),
    );

    const prompt = `
    ### ROLE
You are BLIH Brain, a highly intelligent corporate AI. Your goal is to provide accurate answers based on the provided Knowledge Base and Chat History.

### CAPABILITIES
- You understand HR, Finance, CRM, and internal company data
- You connect knowledge across departments
- You provide precise, factual, and professional answers

### GUIDELINES
1. **Prioritize Context**: Use the "CONTEXT FROM KNOWLEDGE BASE" section below to answer. 
2. **Handle Ambiguity**: If the user uses pronouns (he, she, it, that), resolve them using the "CHAT HISTORY".
3. **Strict Fact-Checking**: If the information is truly missing from the context, only then use your fallback: "I'm sorry, I don't have that specific information in my knowledge base."
4. **Formatting**: Use clean, professional language.
5. If multiple documents exist, synthesize them into one answer.
6. Resolve references using chat history.

### CHAT HISTORY
${chatHistoryString || 'No previous conversation.'}

### CONTEXT FROM KNOWLEDGE BASE
${context || 'No relevant documents found.'}

### USER QUESTION
${question}

### ANSWER (Concise and Accurate):
    `;

    const response = await this.llm.invoke(prompt);

    return {
      answer: this.extractAnswer(response),
      sources: relevantDocs.map((d) => {
        const metadata = d.metadata as { source?: unknown };
        return typeof metadata.source === 'string'
          ? metadata.source
          : 'unknown';
      }),
    };
  }

  async analyzeCv(cvText: string, jobDescription: string) {
    const prompt = `
### ROLE
You are a Technical Headhunter with a reputation for being extremely strict.
You are performing a Binary Skill Gap Audit. Do NOT award points for "transferable skills" if the core technical requirements are missing.

### SCORING SYSTEM (WEIGHTED)
- TECHNICAL STACK (60 pts): Does the candidate know the exact languages/frameworks listed?
  - Deduct 20 points for every missing CORE requirement (e.g., TypeScript, NestJS).
- DOMAIN EXPERIENCE (25 pts): Is their past work in the same field (Software Engineering/AI)?
  - Business Management experience = 0 points in this section for an Engineering role.
- SOFT SKILLS & LEADERSHIP (15 pts): Professionalism and communication.

### AUTO-FAIL RULES
- If the candidate is from a completely unrelated field, the score MUST be below 25.
- If the candidate lacks ALL technical requirements, the recommendation MUST be REJECT.

### RECOMMENDATION LOGIC
- Score >= 85: STRONG_RECOMMEND
- Score 70-84: RECOMMEND
- Score 50-69: CONSIDER
- Score < 50: REJECT

### INPUT DATA
JOB DESCRIPTION:
${JSON.stringify(jobDescription)}

CANDIDATE CV:
${cvText}

### OUTPUT FORMAT (STRICT JSON ONLY)
{
 "score": number,
 "strengths": ["list only relevant technical strengths"],
 "weaknesses": ["list missing technical skills and domain gaps"],
 "recommendation": "STRONG_RECOMMEND" | "RECOMMEND" | "CONSIDER" | "REJECT",
 "summary": "Be blunt. Explain why the candidate is or is not a fit for this specific technical role."
}
`;

    const response = await this.llm.invoke([
      {
        role: 'system',
        content:
          'You are a senior HR recruiter specialized in talent evaluation. Output strictly valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    try {
      const responseTyped = response as { content: string };
      const content = responseTyped.content;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;

      const result: CvAnalysisResult = JSON.parse(
        jsonString,
      ) as CvAnalysisResult;

      return {
        score: Number(result.score ?? 0),
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        recommendation: result.recommendation ?? 'CONSIDER',
        summary: result.summary ?? content,
      };
    } catch {
      this.logger.error(
        'AI returned invalid JSON, falling back to raw content',
      );

      return {
        score: 0,
        strengths: [],
        weaknesses: [],
        recommendation: 'CONSIDER',
        summary: this.extractAnswer(response),
      };
    }
  }
  status() {
    return {
      status: 'AI Service is online',
      model: 'llama3',
      collection: this.collectionName,
    };
  }
}
