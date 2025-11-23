/**
 * Post-deployment script for Render.com
 * Runs after deployment to initialize the database
 */

import { PrismaClient } from '@prisma/client';
import { initDatabase } from './init-database';

const prisma = new PrismaClient();

async function postDeploy() {
  console.log('🚀 Running post-deployment tasks...\n');

  try {
    // 1. Run Prisma migrations
    console.log('1. Running database migrations...');
    // Note: Migrations should be run via `prisma migrate deploy` in build command
    console.log('   ✓ Migrations handled by build process\n');

    // 2. Initialize database (create indexes, etc.)
    console.log('2. Initializing database...');
    await initDatabase();

    // 3. Verify setup
    console.log('3. Verifying setup...');
    const docCount = await prisma.document.count();
    console.log(`   ✓ Database accessible (${docCount} documents)\n`);

    // 4. Check API keys
    console.log('4. Checking API keys...');
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('   ⚠️  ANTHROPIC_API_KEY not set!');
    } else {
      console.log('   ✓ ANTHROPIC_API_KEY configured');
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('   ⚠️  OPENAI_API_KEY not set!');
    } else {
      console.log('   ✓ OPENAI_API_KEY configured');
    }

    console.log('\n✅ Post-deployment tasks complete!\n');
    console.log('🎉 Application ready to serve requests!\n');

  } catch (error) {
    console.error('\n❌ Post-deployment failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  postDeploy()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { postDeploy };

