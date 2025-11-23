-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for vector similarity search (will be added after table creation by Prisma)
-- This file runs on database initialization

