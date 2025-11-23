import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class EmbeddingService {
  private model: string;
  private maxBatchSize: number;

  constructor() {
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.maxBatchSize = 100; // OpenAI's batch limit
  }

  async generateEmbeddings(texts: string[]): Promise<string[]> {
    if (texts.length === 0) {
      return [];
    }

    // Validate inputs
    for (let i = 0; i < texts.length; i++) {
      if (!texts[i] || texts[i].trim().length === 0) {
        throw new Error(`Empty text at index ${i}`);
      }
    }

    try {
      console.log(`Generating embeddings for ${texts.length} texts using ${this.model}`);
      
      const response = await openai.embeddings.create({
        model: this.model,
        input: texts,
      });

      if (response.data.length !== texts.length) {
        throw new Error(`Expected ${texts.length} embeddings but got ${response.data.length}`);
      }

      return response.data.map((item) => JSON.stringify(item.embedding));
    } catch (error: any) {
      console.error('Error generating embeddings:', error);
      
      // Provide more specific error messages
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
      } else if (error.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      } else if (error.status === 401) {
        throw new Error('OpenAI authentication failed. Please verify your API key.');
      }
      
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  async generateSingleEmbedding(text: string): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('Cannot generate embedding for empty text');
    }

    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  /**
   * Process large arrays of texts in batches to avoid API limits
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<string[]> {
    const results: string[] = [];
    
    for (let i = 0; i < texts.length; i += this.maxBatchSize) {
      const batch = texts.slice(i, i + this.maxBatchSize);
      console.log(`Processing embedding batch ${Math.floor(i / this.maxBatchSize) + 1}/${Math.ceil(texts.length / this.maxBatchSize)}`);
      
      const batchEmbeddings = await this.generateEmbeddings(batch);
      results.push(...batchEmbeddings);
      
      // Small delay between batches
      if (i + this.maxBatchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    return results;
  }
}
