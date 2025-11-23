-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for fast vector similarity search
-- This index significantly improves query performance
-- Using cosine distance operator (<=>)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Additional indexes for filtering
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx 
ON document_chunks("documentId");

CREATE INDEX IF NOT EXISTS documents_type_idx 
ON documents(type);

-- Index for chat history queries
CREATE INDEX IF NOT EXISTS chat_messages_session_id_timestamp_idx 
ON chat_messages("sessionId", timestamp DESC);

