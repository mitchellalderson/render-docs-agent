# API Documentation

Complete API reference for the Render Docs Agent backend.

## Base URL

**Development:** `http://localhost:3001`  
**Production:** `https://your-app.onrender.com`

## Authentication

Currently, no authentication is required. In production, you may want to add API keys or OAuth.

---

## Endpoints

### Health Check

#### GET /health

Check if the API and database are operational.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00Z",
  "uptime": 12345.67,
  "database": "connected",
  "environment": "development"
}
```

**Status Codes:**
- `200` - Service healthy
- `503` - Service unavailable (database disconnected)

---

## Documents

### Upload Document

#### POST /api/documents/upload

Upload a documentation file for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (form field)

**Supported Files:**
- Markdown: `.md`, `.markdown`
- OpenAPI: `.json`, `.yaml`, `.yml`

**Size Limit:** 10 MB

**Example:**
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@documentation.md"
```

**Response:**
```json
{
  "message": "Document uploaded and processed successfully",
  "document": {
    "id": "doc_abc123",
    "title": "documentation.md",
    "fileName": "documentation.md",
    "type": "markdown",
    "chunkCount": 45,
    "createdAt": "2024-01-20T10:30:00Z"
  }
}
```

**Status Codes:**
- `201` - Document uploaded successfully
- `400` - Invalid file or file too large
- `429` - Rate limit exceeded (10 uploads per 15 minutes)
- `500` - Processing error

**Rate Limit:** 10 uploads per 15 minutes

---

### List Documents

#### GET /api/documents

Retrieve all uploaded documents.

**Query Parameters:**
- `limit` (optional): Number of documents to return (default: all)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```bash
curl http://localhost:3001/api/documents
```

**Response:**
```json
{
  "documents": [
    {
      "id": "doc_abc123",
      "title": "API Documentation",
      "fileName": "api-docs.md",
      "type": "markdown",
      "createdAt": "2024-01-20T10:30:00Z",
      "_count": {
        "chunks": 45
      }
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success

---

### Get Document

#### GET /api/documents/:id

Retrieve a specific document with all its chunks.

**Parameters:**
- `id`: Document ID

**Example:**
```bash
curl http://localhost:3001/api/documents/doc_abc123
```

**Response:**
```json
{
  "document": {
    "id": "doc_abc123",
    "title": "API Documentation",
    "fileName": "api-docs.md",
    "type": "markdown",
    "content": "...",
    "metadata": {...},
    "createdAt": "2024-01-20T10:30:00Z",
    "chunks": [
      {
        "id": "chunk_xyz789",
        "chunkIndex": 0,
        "content": "...",
        "metadata": {...}
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Document not found

---

### Delete Document

#### DELETE /api/documents/:id

Delete a document and all its chunks.

**Parameters:**
- `id`: Document ID

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/documents/doc_abc123
```

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Document not found

---

### Document Statistics

#### GET /api/documents/stats

Get statistics about uploaded documents.

**Example:**
```bash
curl http://localhost:3001/api/documents/stats
```

**Response:**
```json
{
  "stats": {
    "documentCount": 5,
    "chunkCount": 234,
    "averageChunksPerDocument": 46.8
  }
}
```

**Status Codes:**
- `200` - Success

---

## Chat

### Send Message

#### POST /api/chat

Send a message and get an AI-generated response.

**Request:**
```json
{
  "message": "How do I authenticate with the API?",
  "sessionId": "session_abc123" // Optional, omit for new session
}
```

**Validation:**
- `message`: Required, 1-2000 characters
- `sessionId`: Optional, UUID format

**Example:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I authenticate?"}'
```

**Response:**
```json
{
  "sessionId": "session_abc123",
  "message": "To authenticate with the API, include your API key in the Authorization header...",
  "sources": [
    {
      "documentTitle": "API Documentation",
      "fileName": "api-docs.md",
      "similarity": 0.87,
      "section": "Authentication"
    }
  ],
  "confidence": 87.4,
  "metadata": {
    "documentCount": 1,
    "chunkCount": 3,
    "processingTime": 1243,
    "usage": {
      "inputTokens": 3421,
      "outputTokens": 542
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid message format
- `429` - Rate limit exceeded (20 messages per minute)
- `500` - Processing error

**Rate Limit:** 20 messages per minute

---

### Get Chat History

#### GET /api/chat/history/:sessionId

Retrieve conversation history for a session.

**Parameters:**
- `sessionId`: Session ID

**Example:**
```bash
curl http://localhost:3001/api/chat/history/session_abc123
```

**Response:**
```json
{
  "history": [
    {
      "role": "user",
      "content": "How do I authenticate?"
    },
    {
      "role": "assistant",
      "content": "To authenticate with the API..."
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `404` - Session not found

---

## Admin

### Create Vector Index

#### POST /api/admin/index/create

Create HNSW index for vector similarity search. This significantly improves search performance.

**Example:**
```bash
curl -X POST http://localhost:3001/api/admin/index/create
```

**Response:**
```json
{
  "message": "Vector index created successfully",
  "note": "This improves search performance"
}
```

**Status Codes:**
- `200` - Success
- `500` - Index creation failed

---

### Search Statistics

#### GET /api/admin/stats/search

Get statistics about the search system.

**Example:**
```bash
curl http://localhost:3001/api/admin/stats/search
```

**Response:**
```json
{
  "stats": {
    "totalChunks": 234,
    "chunksWithEmbeddings": 234,
    "indexCoverage": 100,
    "cacheSize": 15
  }
}
```

**Status Codes:**
- `200` - Success

---

### Clear Cache

#### POST /api/admin/cache/clear

Clear the RAG cache (useful for testing or troubleshooting).

**Example:**
```bash
curl -X POST http://localhost:3001/api/admin/cache/clear
```

**Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

**Status Codes:**
- `200` - Success

---

### List Sessions

#### GET /api/admin/sessions

Get all active chat sessions.

**Example:**
```bash
curl http://localhost:3001/api/admin/sessions
```

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session_abc123",
      "messageCount": 12,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:30:00Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success

---

### Get Session Stats

#### GET /api/admin/sessions/:sessionId/stats

Get detailed statistics for a specific session.

**Parameters:**
- `sessionId`: Session ID

**Example:**
```bash
curl http://localhost:3001/api/admin/sessions/session_abc123/stats
```

**Response:**
```json
{
  "stats": {
    "sessionId": "session_abc123",
    "messageCount": 12,
    "createdAt": "2024-01-20T10:00:00Z",
    "lastMessage": "2024-01-20T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Session not found

---

### Clear Session

#### DELETE /api/admin/sessions/:sessionId

Delete all messages in a session.

**Parameters:**
- `sessionId`: Session ID

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/admin/sessions/session_abc123
```

**Response:**
```json
{
  "message": "Session cleared successfully"
}
```

**Status Codes:**
- `200` - Success

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Something went wrong |
| `503` | Service Unavailable - Database or external service down |

---

## Rate Limiting

Rate limits are applied per IP address.

| Endpoint | Limit |
|----------|-------|
| `/api/documents/upload` | 10 requests per 15 minutes |
| `/api/chat` | 20 requests per minute |
| All other `/api/*` | 100 requests per 15 minutes |

**Rate Limit Headers:**
```
RateLimit-Limit: 20
RateLimit-Remaining: 15
RateLimit-Reset: 1642678400
```

When rate limited, you'll receive:
```json
{
  "error": "Too many requests",
  "message": "Please slow down...",
  "retryAfter": "1 minute"
}
```

---

## Data Models

### Document

```typescript
{
  id: string;              // Unique identifier
  title: string;           // Document title
  fileName: string;        // Original file name
  type: 'markdown' | 'openapi';
  content: string;         // Full document content
  metadata: object;        // Additional metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### DocumentChunk

```typescript
{
  id: string;
  documentId: string;
  chunkIndex: number;      // Position in document
  content: string;         // Chunk text
  embedding: number[];     // Vector embedding (1536 dimensions)
  metadata: object;
  createdAt: Date;
}
```

### ChatMessage

```typescript
{
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: object[];      // Only for assistant messages
  timestamp: Date;
}
```

---

## Best Practices

### 1. Document Upload
- Upload documents in logical chunks (not all at once)
- Wait for processing to complete before uploading more
- Use descriptive file names
- Keep documents under 5MB for optimal performance

### 2. Chat Queries
- Be specific in your questions
- Reference context from previous messages
- Use the same `sessionId` to maintain conversation flow
- Monitor confidence scores (low scores may indicate missing documentation)

### 3. Performance
- Create vector index immediately after uploading documents
- Cache is automatic - repeated queries are much faster
- Monitor processing times in metadata
- Clear cache if results seem stale

### 4. Error Handling
- Always check status codes
- Implement retries for 429 (rate limit) and 503 (unavailable)
- Log errors with request IDs for debugging
- Validate input before sending requests

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Upload document
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/documents/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Document ID:', result.document.id);

// Send chat message
const chatResponse = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How do I authenticate?',
    sessionId: 'optional-session-id',
  }),
});

const chatResult = await chatResponse.json();
console.log('AI Response:', chatResult.message);
console.log('Confidence:', chatResult.confidence);
```

### Python

```python
import requests

# Upload document
with open('docs.md', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:3001/api/documents/upload',
        files=files
    )
    result = response.json()
    print(f"Document ID: {result['document']['id']}")

# Send chat message
chat_response = requests.post(
    'http://localhost:3001/api/chat',
    json={
        'message': 'How do I authenticate?',
        'sessionId': 'optional-session-id'
    }
)
chat_result = chat_response.json()
print(f"AI Response: {chat_result['message']}")
print(f"Confidence: {chat_result['confidence']}")
```

### cURL

```bash
# Upload document
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@docs.md"

# Send chat message
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I authenticate?",
    "sessionId": "optional-session-id"
  }'

# Create index
curl -X POST http://localhost:3001/api/admin/index/create

# Get stats
curl http://localhost:3001/api/admin/stats/search
```

---

## Troubleshooting

### "Database connection failed"
Check that PostgreSQL is running and `DATABASE_URL` is correct.

### "Invalid API key"
Ensure `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` are set in `.env`.

### "No relevant documentation found"
- Upload documentation first
- Try rephrasing your question
- Check confidence scores

### Slow responses
- Create vector index: `POST /api/admin/index/create`
- Check processing time in response metadata
- Monitor database performance

### Rate limit errors
- Slow down request rate
- Implement exponential backoff
- Contact support if limits are too restrictive

---

For more information, see the [main README](../README.md) or [testing guide](../TESTING.md).

