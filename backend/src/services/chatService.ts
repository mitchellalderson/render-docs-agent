import { PrismaClient } from '@prisma/client';
import { ClaudeService } from './claudeService';
import { RAGService } from './ragService';

const prisma = new PrismaClient();

export class ChatService {
  private claudeService: ClaudeService;
  private ragService: RAGService;

  constructor() {
    this.claudeService = new ClaudeService();
    this.ragService = new RAGService();
  }

  async processMessage(message: string, sessionId?: string) {
    const startTime = Date.now();
    console.log(`\n=== Chat: Processing message ===`);
    console.log(`Message: "${message.substring(0, 100)}..."`);
    console.log(`Session: ${sessionId || 'new'}`);

    try {
      // Get or create session
      const session = await this.getOrCreateSession(sessionId);

      // Step 1: Retrieve relevant context using RAG
      console.log(`Chat: Step 1/3 - Retrieving context...`);
      const context = await this.ragService.retrieveContext(message);

      // Step 2: Get chat history
      console.log(`Chat: Step 2/3 - Loading chat history...`);
      const history = await this.getChatHistory(session.sessionId);

      // Check if we have any context to work with
      if (!context.hasContext) {
        console.log('Chat: No relevant context found');
        return {
          sessionId: session.sessionId,
          message: this.generateNoContextResponse(),
          sources: [],
          confidence: 0,
          warning: 'No relevant documentation found. Please upload documentation first.',
        };
      }

      // Step 3: Generate response with Claude
      console.log(`Chat: Step 3/3 - Generating AI response...`);
      const response = await this.claudeService.generateResponse(
        message,
        context,
        history
      );

      // Save messages
      await this.saveMessages(session.sessionId, message, response.content, response.sources);

      const duration = Date.now() - startTime;
      console.log(`Chat: Complete in ${duration}ms`);
      console.log(`=== End Chat Processing ===\n`);

      return {
        sessionId: session.sessionId,
        message: response.content,
        sources: response.sources,
        confidence: context.confidence,
        metadata: {
          documentCount: context.documentCount,
          chunkCount: context.chunkCount,
          processingTime: duration,
          usage: response.usage,
        },
      };
    } catch (error: any) {
      console.error('Chat: Error processing message:', error);
      
      // Return user-friendly error messages
      if (error.message.includes('API key')) {
        throw new Error('API configuration error. Please contact support.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  private async getOrCreateSession(sessionId?: string) {
    if (sessionId) {
      const existing = await prisma.chatSession.findUnique({
        where: { sessionId },
      });
      if (existing) {
        console.log(`Chat: Using existing session ${sessionId}`);
        return existing;
      }
    }

    const newSession = await prisma.chatSession.create({
      data: {},
    });
    
    console.log(`Chat: Created new session ${newSession.sessionId}`);
    return newSession;
  }

  async getChatHistory(sessionId: string) {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
      take: 20, // Limit history to last 20 messages
    });

    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private async saveMessages(
    sessionId: string,
    userMessage: string,
    assistantMessage: string,
    sources: any
  ) {
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId,
          role: 'user',
          content: userMessage,
        },
        {
          sessionId,
          role: 'assistant',
          content: assistantMessage,
          sources,
        },
      ],
    });

    console.log(`Chat: Messages saved to session ${sessionId}`);
  }

  /**
   * Generate a helpful response when no context is available
   */
  private generateNoContextResponse(): string {
    return `I couldn't find relevant information in the uploaded documentation to answer your question.

Here are some things you can try:

1. **Rephrase your question** - Try asking in a different way or with more specific terms
2. **Upload documentation** - Make sure you've uploaded the relevant documentation files
3. **Check your question** - Ensure your question is about topics covered in the uploaded docs

If you need help with something specific, please let me know and I'll do my best to assist!`;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string) {
    const messageCount = await prisma.chatMessage.count({
      where: { sessionId },
    });

    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: 1,
        },
      },
    });

    return {
      sessionId,
      messageCount,
      createdAt: session?.createdAt,
      lastMessage: session?.updatedAt,
    };
  }

  /**
   * Clear session history
   */
  async clearSession(sessionId: string) {
    await prisma.chatMessage.deleteMany({
      where: { sessionId },
    });

    console.log(`Chat: Cleared session ${sessionId}`);
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions() {
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return sessions.map((s) => ({
      sessionId: s.sessionId,
      messageCount: s._count.messages,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }
}
