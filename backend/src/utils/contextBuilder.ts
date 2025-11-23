/**
 * Context Builder - Assembles context for LLM prompts
 * Handles token counting, context length limits, and formatting
 */

interface Chunk {
  content: string;
  metadata: {
    documentTitle?: string;
    fileName?: string;
    similarity?: number;
    section?: string;
    [key: string]: any;
  };
}

interface ContextOptions {
  maxTokens?: number;
  includeMetadata?: boolean;
  formatStyle?: 'simple' | 'detailed' | 'compact';
}

export class ContextBuilder {
  private readonly maxContextTokens: number;
  private readonly avgCharsPerToken: number;

  constructor() {
    // Conservative estimates for token counting
    this.maxContextTokens = 8000; // Leave room for conversation history and response
    this.avgCharsPerToken = 4; // Rough approximation (varies by model)
  }

  /**
   * Build formatted context from chunks
   */
  buildContext(chunks: Chunk[], options: ContextOptions = {}): string {
    const maxTokens = options.maxTokens || this.maxContextTokens;
    const formatStyle = options.formatStyle || 'detailed';

    if (chunks.length === 0) {
      return 'No relevant documentation found.';
    }

    let context = '';
    let estimatedTokens = 0;
    const includedChunks: Chunk[] = [];

    for (const chunk of chunks) {
      const formattedChunk = this.formatChunk(chunk, includedChunks.length + 1, formatStyle);
      const chunkTokens = this.estimateTokens(formattedChunk);

      if (estimatedTokens + chunkTokens > maxTokens) {
        console.log(`ContextBuilder: Token limit reached (${estimatedTokens}/${maxTokens})`);
        break;
      }

      context += formattedChunk + '\n\n';
      estimatedTokens += chunkTokens;
      includedChunks.push(chunk);
    }

    console.log(`ContextBuilder: Built context with ${includedChunks.length}/${chunks.length} chunks (~${estimatedTokens} tokens)`);

    return context.trim();
  }

  /**
   * Format a single chunk
   */
  private formatChunk(chunk: Chunk, index: number, style: string): string {
    switch (style) {
      case 'simple':
        return chunk.content;

      case 'compact':
        return `[${index}] ${chunk.content}`;

      case 'detailed':
      default:
        const metadata = chunk.metadata;
        const source = metadata.fileName || metadata.documentTitle || 'Unknown';
        const section = metadata.section ? ` - ${metadata.section}` : '';
        const similarity = metadata.similarity ? ` (relevance: ${(metadata.similarity * 100).toFixed(0)}%)` : '';

        return `[${source}${section}]${similarity}

${chunk.content}

---`;
    }
  }

  /**
   * Estimate token count from text
   */
  estimateTokens(text: string): number {
    // Simple character-based estimation
    // More accurate: use tiktoken library, but adds dependency
    return Math.ceil(text.length / this.avgCharsPerToken);
  }

  /**
   * Truncate text to fit within token limit
   */
  truncateToTokens(text: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(text);
    
    if (estimatedTokens <= maxTokens) {
      return text;
    }

    const targetChars = maxTokens * this.avgCharsPerToken;
    return text.substring(0, targetChars) + '... [truncated]';
  }

  /**
   * Build context with conversation history
   */
  buildContextWithHistory(
    chunks: Chunk[],
    conversationHistory: Array<{ role: string; content: string }>,
    options: ContextOptions = {}
  ): { context: string; historyToInclude: number } {
    const maxTokens = options.maxTokens || this.maxContextTokens;

    // Reserve tokens for context chunks
    const contextReserved = Math.floor(maxTokens * 0.7); // 70% for context
    const historyReserved = Math.floor(maxTokens * 0.3); // 30% for history

    const context = this.buildContext(chunks, { ...options, maxTokens: contextReserved });
    const contextTokens = this.estimateTokens(context);

    // Calculate how much history we can include
    const remainingTokens = maxTokens - contextTokens;
    let historyTokens = 0;
    let historyCount = 0;

    // Add history from most recent to oldest
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      const msgTokens = this.estimateTokens(msg.content);

      if (historyTokens + msgTokens > remainingTokens) {
        break;
      }

      historyTokens += msgTokens;
      historyCount++;
    }

    console.log(`ContextBuilder: Including ${historyCount}/${conversationHistory.length} history messages`);

    return {
      context,
      historyToInclude: historyCount,
    };
  }

  /**
   * Group chunks by document
   */
  groupByDocument(chunks: Chunk[]): Record<string, Chunk[]> {
    return chunks.reduce((acc, chunk) => {
      const fileName = chunk.metadata.fileName || 'Unknown';
      if (!acc[fileName]) {
        acc[fileName] = [];
      }
      acc[fileName].push(chunk);
      return acc;
    }, {} as Record<string, Chunk[]>);
  }

  /**
   * Create a summary of available sources
   */
  createSourcesSummary(chunks: Chunk[]): string {
    const byDocument = this.groupByDocument(chunks);
    const summaryLines = Object.entries(byDocument).map(([fileName, docChunks]) => {
      return `- ${fileName} (${docChunks.length} section${docChunks.length > 1 ? 's' : ''})`;
    });

    return `Available documentation:\n${summaryLines.join('\n')}`;
  }
}

