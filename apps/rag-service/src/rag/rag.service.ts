import { Injectable } from '@nestjs/common';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

@Injectable()
export class RagService {
  private llm: ChatOllama;
  private embeddings: OllamaEmbeddings;
  private readonly qdrantUrl = process.env.QDRANT_URL;
  private readonly collectionName = 'company_knowledge';

  constructor() {
    this.llm = new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: 'llama3.2',
      numPredict: 1024,
    });

    this.embeddings = new OllamaEmbeddings({
      baseUrl: process.env.OLLAMA_BASE_URL,
      model: 'nomic-embed-text',
    });
  }
  status() {
    return {
      status: 'AI Service is online',
      model: 'llama3',
      collection: this.collectionName,
    };
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

  async ingest(text: string, source: string) {
    const doc = new Document({
      pageContent: text,
      metadata: {
        source,
        date_ingested: new Date().toISOString(),
      },
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 150,
    });

    const splitDocs = await splitter.splitDocuments([doc]);

    await QdrantVectorStore.fromDocuments(splitDocs, this.embeddings, {
      url: this.qdrantUrl,
      collectionName: this.collectionName,
    });

    return { message: `Successfully ingested ${splitDocs.length} chunks.` };
  }

  async askQuestion(question: string) {
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      this.embeddings,
      {
        url: this.qdrantUrl,
        collectionName: this.collectionName,
      },
    );

    const relevantDocs = await vectorStore.similaritySearch(question, 3);

    console.log(
      'Context Found:',
      relevantDocs.map((d) => d.pageContent),
    );

    const context = relevantDocs.map((d) => d.pageContent).join('\n\n');

    const prompt = `Use the context to answer the question thoroughly.
    Context: ${context}
    Question: ${question}`;

    const result = await this.llm.invoke(prompt);

    return { answer: result.content };
  }
}
