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
      format: 'json',
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
    console.log(`Ingesting text from: ${source}`);
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

  async processPDF(fileBuffer: Buffer) {
    const blob = new Blob([new Uint8Array(fileBuffer)], {
      type: 'application/pdf',
    });

    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    await QdrantVectorStore.fromDocuments(splitDocs, this.embeddings, {
      url: this.qdrantUrl,
      collectionName: this.collectionName,
    });

    return { message: `Successfully processed ${splitDocs.length} chunks.` };
  }

  async askQuestion(
    question: string,
    history: { role: string; content: string }[] = [],
    filter: any = {}
  ) {
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      this.embeddings,
      {
        url: this.qdrantUrl,
        collectionName: this.collectionName,
      },
    );

    const relevantDocs = await vectorStore.similaritySearch(question, 3, filter);

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
    You are BLIH Brain, an expert corporate assistant.
    Use the following context and chat history to answer the user's question accurately.

    RULES:
    1. If the answer is not in the context, say: "I'm sorry, I don't have that specific information in my knowledge base."
    2. Do not make up facts.
    3. Be professional and concise.

    CHAT HISTORY:
    ${chatHistoryString}

    CONTEXT FROM KNOWLEDGE BASE:
    ${context}

    USER QUESTION: ${question}
    
    ANSWER:
    `;

    const response = await this.llm.invoke(prompt);
    return { 
      answer: response.content,
      sources: relevantDocs.map(d =>d.metadata.source) 
    };
  }

  async analyzeCv(cvText: string, jobDescription: string) {

  const prompt = `
You are a senior HR recruiter specializing in candidate evaluation.

Your task is to compare a candidate CV with a job description and evaluate suitability.

RECOMMENDATION LOGIC:
- If score > 70: SELECT
- If score 50-70: PAUSE
- If score < 50: DECLINE

Return ONLY valid JSON in this format:

{
 "score": number,
 "strengths": ["..."],
 "weaknesses": ["..."],
 "recommendation": "SELECT | DECLINE | PAUSE",
 "summary": "short explanation"
}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE CV:
${cvText}
`;

  const response = await this.llm.invoke([
    {
      role: "system",
      content: "You are a senior HR recruiter specialized in talent evaluation."
    },
    {
      role: "user",
      content: prompt
    }
  ]);

  try {
  // Use a regex to find the JSON block if the AI adds conversational text
  const jsonMatch = (response.content as string).match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : response.content as string;
  return JSON.parse(jsonString);
} catch (e) {
  this.logger.error("AI returned invalid JSON, falling back to raw content");
  return {
    score: 0,
    strengths: [],
    weaknesses: [],
    recommendation: "REVIEW",
    summary: response.content
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
