import { Injectable, Logger } from '@nestjs/common';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { WebPDFLoader } from '@langchain/community/document_loaders/web/pdf';

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

  async ingest(text: string, source: string, metadata?: Record<string, any>) {
    const cleanMetadata = metadata
      ? Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [
            k,
            typeof v === 'string' ? v.replace(/"/g, '') : v,
          ]),
        )
      : {};

    console.log(`Ingesting text from: ${source} with matadate:`, cleanMetadata);
    const doc = new Document({
      pageContent: text,
      metadata: {
        ...metadata,
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

    const docsWithMetadata = docs.map((d) => ({
      ...d,
      metadata: {
        ...d.metadata,
        ...metadata,
        source: fileName,
      },
    }));

    const splitDocs = await splitter.splitDocuments(docsWithMetadata);

    await QdrantVectorStore.fromDocuments(splitDocs, this.embeddings, {
      url: this.qdrantUrl,
      collectionName: this.collectionName,
    });

    return {
      message: `Successfully processed ${splitDocs.length} chunks or ${fileName}.`,
    };
  }

  async analyzeImage(fileBuffer: Buffer): Promise<{ description: string }> {
    const base64Image = fileBuffer.toString('base64');

    const visionModel = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: 'llava',
    });

    const response = await visionModel.invoke([
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
    ]);

    return { description: response.content as string };
  }
  transcribeAudio(_fileBuffer: Buffer): Promise<{ text: string }> {
    this.logger.warn(
      'Audio transcription called - ensure Whisper service is configured.',
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

### GUIDELINES
1. **Prioritize Context**: Use the "CONTEXT FROM KNOWLEDGE BASE" section below to answer. 
2. **Handle Ambiguity**: If the user uses pronouns (he, she, it, that), resolve them using the "CHAT HISTORY".
3. **Strict Fact-Checking**: If the information is truly missing from the context, only then use your fallback: "I'm sorry, I don't have that specific information in my knowledge base."
4. **Formatting**: Use clean, professional language.

### CHAT HISTORY
${chatHistoryString || 'No previous conversation.'}

### CONTEXT FROM KNOWLEDGE BASE
${context}

### USER QUESTION
${question}

### ANSWER (Concise and Accurate):
    `;

    const response = await this.llm.invoke(prompt);
    return {
      answer: response.content as string,
      sources: relevantDocs.map((d) => d.metadata.source),
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
- If the candidate is from a completely unrelated field (e.g., Manager applying for Engineer), the score MUST be below 25.
- If the candidate lacks ALL technical requirements, the recommendation MUST be REJECT.

### RECOMMENDATION LOGIC
- Score >= 85: STRONG_RECOMMEND (Perfect technical and cultural fit)
- Score 70-84: RECOMMEND (Strong tech skills, minor experience gaps)
- Score 50-69: CONSIDER (Has some tech skills but needs training)
- Score < 50: REJECT (Missing core tech stack or unrelated background)

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
          'You are a senior HR recruiter specialized in talent evaluation. You output strictly valid JSON using the provided schema.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]);

    try {
      const jsonMatch = (response.content as string).match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch
        ? jsonMatch[0]
        : (response.content as string);
      const result = JSON.parse(jsonString);

      return {
        score: Number(result.score) || 0,
        strengths: Array.isArray(result.strengths) ? result.strengths : [],
        weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
        recommendation: String(result.recommendation || 'CONSIDER'),
        summary: String(result.summary || response.content),
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
        summary: response.content as string,
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
