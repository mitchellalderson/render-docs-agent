import Anthropic from '@anthropic-ai/sdk';
import { ContextBuilder } from '../utils/contextBuilder';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: string;
  content: string;
}

interface Context {
  chunks: Array<{
    content: string;
    metadata: any;
  }>;
  hasContext: boolean;
  confidence: number;
  documentCount?: number;
  chunkCount?: number;
}

export class ClaudeService {
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private contextBuilder: ContextBuilder;

  constructor() {
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '4096');
    this.temperature = parseFloat(process.env.CLAUDE_TEMPERATURE || '0.3');
    this.contextBuilder = new ContextBuilder();
  }

  async generateResponse(
    userMessage: string,
    context: Context,
    history: Message[]
  ) {
    console.log(`Claude: Generating response for message: "${userMessage.substring(0, 100)}..."`);
    console.log(`Claude: Context available: ${context.hasContext}, Confidence: ${context.confidence?.toFixed(1)}%`);

    try {
      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(context, userMessage);
      
      // Build messages with history
      const messages = this.buildMessages(history, userMessage);

      // Generate response
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: messages as any,
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      console.log(`Claude: Generated response (${content.length} chars, ${response.usage.input_tokens} input tokens, ${response.usage.output_tokens} output tokens)`);

      return {
        content,
        sources: context.chunks.map((chunk) => chunk.metadata),
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        confidence: context.confidence,
      };
    } catch (error: any) {
      console.error('Claude: Error calling API:', error);
      
      // Provide specific error messages
      if (error.status === 401) {
        throw new Error('Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY environment variable.');
      } else if (error.status === 429) {
        throw new Error('Anthropic rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 529) {
        throw new Error('Anthropic API is temporarily overloaded. Please try again.');
      }
      
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  private buildSystemPrompt(context: Context, query: string): string {
    if (!context.hasContext || context.chunks.length === 0) {
      return this.buildNoContextPrompt();
    }

    // Build context with proper formatting
    const formattedContext = this.contextBuilder.buildContext(
      context.chunks,
      { formatStyle: 'detailed', maxTokens: 6000 }
    );

    // Create sources summary
    const sourcesSummary = this.contextBuilder.createSourcesSummary(context.chunks);

    // Build comprehensive system prompt
    return `You are an expert documentation assistant. Your role is to help users understand and use a product or library by answering questions based on the official documentation.

## Available Documentation

${sourcesSummary}

## Documentation Context

${formattedContext}

## Instructions

1. **Base answers on the provided context**: Only provide information that can be found in or reasonably inferred from the documentation above.

2. **Cite sources**: When referencing specific information, mention which source it comes from (e.g., "According to Source 1..." or "As shown in the API documentation...").

3. **Be accurate and precise**: If the documentation doesn't contain the answer, clearly state that. Don't make assumptions or provide information not in the documentation.

4. **Format code properly**: Use proper markdown formatting with syntax highlighting for code examples. If the documentation includes code examples, use them in your response.

5. **Be helpful and clear**: Provide step-by-step explanations when appropriate. Break down complex topics into understandable parts.

6. **Consider context quality**: You're working with documentation that has a ${context.confidence?.toFixed(0)}% relevance match to the user's question. If the match is low (<70%), acknowledge potential limitations.

7. **Handle ambiguity**: If the question is unclear or could have multiple interpretations, ask for clarification or address multiple possibilities.

## Response Format

- Use markdown formatting for better readability
- Include code blocks with appropriate language tags
- Use bullet points or numbered lists for steps
- Bold important terms or concepts
- Include relevant examples from the documentation

Remember: Your goal is to help users succeed with this product/library by providing accurate, helpful, and well-sourced answers.`;
  }

  private buildNoContextPrompt(): string {
    return `You are a helpful documentation assistant. However, no relevant documentation was found for this query.

Please let the user know that:
1. You couldn't find relevant information in the uploaded documentation
2. They might want to:
   - Rephrase their question
   - Upload additional documentation
   - Check if the topic is covered in their documentation
3. You can only answer questions based on the uploaded documentation

Be polite and helpful, and suggest alternative approaches to finding the information they need.`;
  }

  private buildMessages(history: Message[], currentMessage: string) {
    // Include recent conversation history (last 10 messages)
    const recentHistory = history.slice(-10);

    const messages = [
      ...recentHistory.map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: currentMessage,
      },
    ];

    return messages;
  }

  /**
   * Generate a streaming response (for future enhancement)
   */
  async generateStreamingResponse(
    userMessage: string,
    context: Context,
    history: Message[],
    onChunk: (chunk: string) => void
  ) {
    const systemPrompt = this.buildSystemPrompt(context, userMessage);
    const messages = this.buildMessages(history, userMessage);

    const stream = await anthropic.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      messages: messages as any,
    });

    let fullContent = '';

    stream.on('text', (text) => {
      fullContent += text;
      onChunk(text);
    });

    await stream.finalMessage();

    return {
      content: fullContent,
      sources: context.chunks.map((chunk) => chunk.metadata),
      confidence: context.confidence,
    };
  }
}
