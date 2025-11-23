/**
 * Database Initialization Script
 * Creates necessary indexes and optimizations for the application
 */

import { PrismaClient } from '@prisma/client';
import { RAGService } from '../services/ragService';

const prisma = new PrismaClient();
const ragService = new RAGService();

async function initDatabase() {
  console.log('🔧 Initializing database...\n');

  try {
    // 1. Check database connection
    console.log('1. Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✓ Database connected\n');

    // 2. Verify pgvector extension
    console.log('2. Checking pgvector extension...');
    const extensions: any[] = await prisma.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
    
    if (extensions.length === 0) {
      console.log('   ! pgvector not found, attempting to create...');
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector;`;
      console.log('   ✓ pgvector extension created\n');
    } else {
      console.log('   ✓ pgvector extension already exists\n');
    }

    // 3. Create vector index
    console.log('3. Creating HNSW vector index...');
    await ragService.createIndex();
    console.log('   ✓ Vector index created\n');

    // 4. Get statistics
    console.log('4. Database statistics:');
    const documentCount = await prisma.document.count();
    const chunkCount = await prisma.documentChunk.count();
    const sessionCount = await prisma.chatSession.count();
    const messageCount = await prisma.chatMessage.count();

    console.log(`   - Documents: ${documentCount}`);
    console.log(`   - Chunks: ${chunkCount}`);
    console.log(`   - Chat Sessions: ${sessionCount}`);
    console.log(`   - Messages: ${messageCount}\n`);

    // 5. Verify vector index
    console.log('5. Verifying indexes...');
    const indexes: any[] = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE '%embedding%';
    `;
    
    if (indexes.length > 0) {
      console.log('   ✓ Vector index verified:');
      indexes.forEach((idx) => {
        console.log(`     - ${idx.indexname} on ${idx.tablename}`);
      });
    } else {
      console.log('   ⚠ No vector indexes found (they may be created on first use)');
    }

    console.log('\n✅ Database initialization complete!\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initDatabase };

