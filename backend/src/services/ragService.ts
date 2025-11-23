import { PrismaClient } from '@prisma/client';
import { EmbeddingService } from './embeddingService';
import { ContextBuilder } from '../utils/contextBuilder';

const prisma = new PrismaClient();

interface SearchOptions {
  topK?: number;
  threshold?: number;
  documentType?: string;
  documentId?: string;
}

interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
  documentTitle: string;
  fileName: string;
  chunkIndex: number;
}

export class RAGService {
  private embeddingService: EmbeddingService;
  private contextBuilder: ContextBuilder;
  private defaultTopK: number;
  private defaultThreshold: number;
  private cache: Map<string, { results: SearchResult[]; timestamp: number }>;
  private cacheTTL: number;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.contextBuilder = new ContextBuilder();
    this.defaultTopK = 10;
    this.defaultThreshold = 0.5; // Cosine similarity threshold
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Retrieve relevant context for a query using semantic search
   */
  async retrieveContext(query: string, options: SearchOptions = {}) {
    const startTime = Date.now();
    console.log(`RAG: Retrieving context for query: "${query.substring(0, 100)}..."`);

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(query, options);
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`RAG: Cache hit for query (${cached.results.length} chunks)`);
        return this.formatResults(cached.results);
      }

      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateSingleEmbedding(query);

      // Perform vector similarity search
      const results = await this.performSearch(queryEmbedding, options);

      // Cache results
      this.cache.set(cacheKey, {
        results,
        timestamp: Date.now(),
      });

      // Clean up old cache entries periodically
      this.cleanCache();

      const duration = Date.now() - startTime;
      console.log(`RAG: Retrieved ${results.length} relevant chunks in ${duration}ms`);
      console.log(`RAG: Similarity scores: ${results.map(r => r.similarity.toFixed(3)).join(', ')}`);

      return this.formatResults(results);
    } catch (error) {
      console.error('RAG: Error retrieving context:', error);
      throw error;
    }
  }

  /**
   * Perform vector similarity search with optional filters
   */
  private async performSearch(
    queryEmbedding: string,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const topK = options.topK || this.defaultTopK;
    const threshold = options.threshold || this.defaultThreshold;

    let query = `
      SELECT 
        dc.id,
        dc.content,
        dc.metadata,
        dc."chunkIndex",
        d.title as document_title,
        d."fileName" as file_name,
        d.type as document_type,
        1 - (dc.embedding <=> $1::vector) as similarity
      FROM document_chunks dc
      JOIN documents d ON dc."documentId" = d.id
      WHERE dc.embedding IS NOT NULL
    `;

    const params: any[] = [queryEmbedding];
    let paramIndex = 2;

    // Add optional filters
    if (options.documentType) {
      query += ` AND d.type = $${paramIndex}`;
      params.push(options.documentType);
      paramIndex++;
    }

    if (options.documentId) {
      query += ` AND d.id = $${paramIndex}`;
      params.push(options.documentId);
      paramIndex++;
    }

    query += `
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $${paramIndex}
    `;
    params.push(topK * 2); // Get extra results for filtering

    const results: any[] = await prisma.$queryRawUnsafe(query, ...params);

    // Filter by similarity threshold
    const filteredResults = results
      .filter((r) => r.similarity >= threshold)
      .slice(0, topK);

    // If we have very few results, lower the threshold
    if (filteredResults.length < 3 && results.length > 0) {
      console.log(`RAG: Low result count (${filteredResults.length}), lowering threshold`);
      const lowerThreshold = threshold * 0.8;
      return results.filter((r) => r.similarity >= lowerThreshold).slice(0, topK);
    }

    return filteredResults;
  }

  /**
   * Format search results for context building
   */
  private formatResults(results: SearchResult[]) {
    if (results.length === 0) {
      return {
        chunks: [],
        hasContext: false,
        confidence: 0,
      };
    }

    // Calculate average similarity as confidence score
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    const confidence = Math.min(avgSimilarity * 100, 100);

    // Group results by document for better context
    const chunksByDocument = this.groupByDocument(results);

    return {
      chunks: results.map((r) => ({
        content: r.content,
        metadata: {
          ...r.metadata,
          documentTitle: r.documentTitle,
          fileName: r.fileName,
          similarity: r.similarity,
          chunkIndex: r.chunkIndex,
        },
      })),
      hasContext: true,
      confidence,
      documentCount: Object.keys(chunksByDocument).length,
      chunkCount: results.length,
    };
  }

  /**
   * Group search results by document
   */
  private groupByDocument(results: SearchResult[]) {
    return results.reduce((acc, result) => {
      const fileName = result.fileName;
      if (!acc[fileName]) {
        acc[fileName] = [];
      }
      acc[fileName].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);
  }

  /**
   * Create index for better search performance
   */
  async createIndex() {
    try {
      console.log('RAG: Creating HNSW index for vector search...');
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
        ON document_chunks 
        USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
      `;
      
      console.log('RAG: Index created successfully');
    } catch (error: any) {
      // Index might already exist
      if (!error.message.includes('already exists')) {
        console.error('RAG: Error creating index:', error);
      }
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats() {
    const totalChunks = await prisma.documentChunk.count();
    
    // Use raw query to count chunks with embeddings (Prisma type system limitation)
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count 
      FROM document_chunks 
      WHERE embedding IS NOT NULL
    `;
    const chunksWithEmbeddings = Number(result[0].count);

    return {
      totalChunks,
      chunksWithEmbeddings,
      indexCoverage: totalChunks > 0 ? (chunksWithEmbeddings / totalChunks) * 100 : 0,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Rerank results based on additional factors
   */
  private rerankResults(results: SearchResult[], query: string): SearchResult[] {
    // Simple reranking based on:
    // 1. Semantic similarity (already have)
    // 2. Keyword overlap
    // 3. Chunk position (earlier chunks often more important)

    return results.map((result) => {
      let score = result.similarity;

      // Boost for exact keyword matches
      const queryWords = query.toLowerCase().split(/\s+/);
      const contentWords = result.content.toLowerCase().split(/\s+/);
      const keywordOverlap = queryWords.filter((w) => contentWords.includes(w)).length;
      const keywordBoost = (keywordOverlap / queryWords.length) * 0.1;

      // Boost for earlier chunks (introduction often contains important info)
      const positionBoost = result.chunkIndex < 5 ? 0.05 : 0;

      score = Math.min(score + keywordBoost + positionBoost, 1.0);

      return { ...result, similarity: score };
    }).sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Generate cache key
   */
  private getCacheKey(query: string, options: SearchOptions): string {
    return `${query}:${JSON.stringify(options)}`;
  }

  /**
   * Clean up old cache entries
   */
  private cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('RAG: Cache cleared');
  }
}
