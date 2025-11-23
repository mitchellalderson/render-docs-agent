import { PrismaClient } from '@prisma/client';
import { EmbeddingService } from './embeddingService';
import { MarkdownParser } from '../utils/markdownParser';
import { OpenAPIParser } from '../utils/openAPIParser';

const prisma = new PrismaClient();

export class DocumentService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async processUpload(buffer: Buffer, fileName: string, mimeType: string) {
    console.log(`Processing upload: ${fileName} (${buffer.length} bytes)`);

    // Determine document type
    const isMarkdown = fileName.toLowerCase().match(/\.(md|markdown)$/);
    const isOpenAPI = fileName.toLowerCase().match(/\.(json|ya?ml)$/);

    let type: string;
    let content: string;
    let chunks: Array<{ content: string; metadata: any }>;

    try {
      if (isMarkdown) {
        type = 'markdown';
        content = buffer.toString('utf-8');
        console.log(`Parsing Markdown document: ${fileName}`);
        chunks = MarkdownParser.parse(content, fileName);
      } else if (isOpenAPI) {
        type = 'openapi';
        const parsedContent = buffer.toString('utf-8');
        content = parsedContent;
        console.log(`Parsing OpenAPI document: ${fileName}`);
        chunks = await OpenAPIParser.parse(parsedContent, fileName);
      } else {
        throw new Error('Unsupported file type. Please upload Markdown (.md) or OpenAPI (.json, .yaml) files.');
      }

      console.log(`Document parsed into ${chunks.length} chunks`);

      // Save document
      const document = await prisma.document.create({
        data: {
          title: fileName,
          content,
          type,
          fileName,
          metadata: {
            chunkCount: chunks.length,
            sizeBytes: buffer.length,
          },
        },
      });

      console.log(`Document saved with ID: ${document.id}`);

      // Generate embeddings and save chunks (this may take a while)
      await this.processChunks(document.id, chunks);

      console.log(`Successfully processed document: ${fileName}`);

      return {
        ...document,
        chunkCount: chunks.length,
      };
    } catch (error) {
      console.error('Error processing upload:', error);
      throw error;
    }
  }

  private async processChunks(
    documentId: string,
    chunks: Array<{ content: string; metadata: any }>
  ) {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    try {
      // Process in batches to avoid rate limits and memory issues
      const batchSize = 20;
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(chunks.length / batchSize);
        
        console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)`);

        // Generate embeddings for this batch
        const embeddings = await this.embeddingService.generateEmbeddings(
          batch.map((c) => c.content)
        );

        // Save chunks with embeddings
        const chunkPromises = batch.map((chunk, batchIndex) => {
          const globalIndex = i + batchIndex;
          return prisma.$executeRaw`
            INSERT INTO document_chunks (id, "documentId", "chunkIndex", content, embedding, metadata, "createdAt")
            VALUES (
              gen_random_uuid()::text,
              ${documentId},
              ${globalIndex},
              ${chunk.content},
              ${embeddings[batchIndex]}::vector,
              ${JSON.stringify(chunk.metadata)}::jsonb,
              NOW()
            )
          `;
        });

        await Promise.all(chunkPromises);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Successfully processed all ${chunks.length} chunks`);
    } catch (error) {
      console.error('Error processing chunks:', error);
      // Clean up the document if chunk processing fails
      await prisma.document.delete({ where: { id: documentId } });
      throw new Error('Failed to process document chunks. Document has been removed.');
    }
  }

  async getAllDocuments() {
    return prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });
  }

  async getDocumentById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            content: true,
            metadata: true,
          },
          orderBy: { chunkIndex: 'asc' },
        },
      },
    });
  }

  async deleteDocument(id: string) {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    await prisma.document.delete({
      where: { id },
    });

    console.log(`Deleted document: ${document.fileName}`);
  }

  async getStats() {
    const documentCount = await prisma.document.count();
    const chunkCount = await prisma.documentChunk.count();
    
    return {
      documentCount,
      chunkCount,
      averageChunksPerDocument: documentCount > 0 ? chunkCount / documentCount : 0,
    };
  }
}
