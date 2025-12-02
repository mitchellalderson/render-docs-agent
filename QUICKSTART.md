---

# 🚀 Quickstart Guide

Get the Docs Agent running locally in under 5 minutes using Docker Compose!

## Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Anthropic API key** ([Get one here](https://console.anthropic.com/))
- **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))

That's it! Docker handles everything else (PostgreSQL, pgvector, Node.js, etc.)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd render-docs-agent
```

### 2. Create Environment File

**Option A: Use the template (Recommended)**

```bash
cp env.example .env
# Then edit .env and add your API keys
```

**Option B: Create manually**

Create a file named `.env` in the root directory:

```bash
# Copy this template and fill in your API keys
cat > .env << 'EOF'
# Required: Your API keys
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key-here
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Database configuration (change password for production)
# IMPORTANT: Database name MUST be "docs_agent" with underscore!
POSTGRES_USER=docsagent
POSTGRES_PASSWORD=docsagent_dev_password
POSTGRES_DB=docs_agent

# Backend configuration
NODE_ENV=development
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000

# OpenAI configuration
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Claude configuration
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096
CLAUDE_TEMPERATURE=0.3

# App configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Docs Agent
MAX_FILE_SIZE=10485760
EOF
```

**Important:** Replace the placeholder API keys with your real ones!

### 3. Start Everything

```bash
docker compose up -d
```

This single command will:
- ✅ Download and start PostgreSQL with pgvector
- ✅ Build and start the backend API
- ✅ Run database migrations automatically
- ✅ Initialize vector indexes
- ✅ Build and start the frontend UI

**First-time setup takes 2-3 minutes** to build Docker images. Subsequent starts are instant!

### 4. Open the App

Once the containers are running, open your browser to:

**http://localhost:3000**

You should see the docs agent interface ready to upload documentation!

## 🎉 You're Done!

That's it! You now have a fully functional AI-powered docs agent with:
- Vector database (PostgreSQL + pgvector with HNSW indexing)
- Backend API with advanced RAG pipeline
- Beautiful chat interface
- Document upload system (Markdown & OpenAPI specs)

## Try It Out

### Upload Sample Documentation

The project includes test documentation files. Try uploading one:

**Using the UI:**
1. Open http://localhost:3000
2. Drag and drop `test-docs/example-api.md` onto the sidebar
3. Wait for processing (~10-30 seconds)
4. Start asking questions!

**Using the API:**
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@test-docs/example-api.md"
```

### Ask Questions

Once a document is uploaded, try asking:
- "How do I authenticate with the API?"
- "What endpoints are available?"
- "Show me an example of creating a user"
- "What are the rate limits?"

The AI will search your documentation and provide accurate answers with source citations!

## Useful Commands

### View logs
```bash
# All services
docker compose logs -f

# Just backend
docker compose logs -f backend

# Just frontend
docker compose logs -f frontend

# Just database
docker compose logs -f database
```

### Stop everything
```bash
docker compose down
```

### Restart everything
```bash
docker compose restart
```

### Rebuild after code changes
```bash
docker compose up -d --build
```

### Using Make commands
```bash
make up        # Start services
make down      # Stop services
make logs      # View all logs
make restart   # Restart services
make clean     # Clean everything
```

## What's Running?

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | http://localhost:3000 | Chat UI & document management |
| Backend API | http://localhost:3001 | RAG endpoints & document processing |
| PostgreSQL | localhost:5432 | Vector database with pgvector |

## Verify It's Working

### 1. Check all services are running:
```bash
docker compose ps
```

You should see all three services with status "Up".

### 2. Check backend health:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

### 3. Check document stats:
```bash
curl http://localhost:3001/api/documents/stats
```

Should return:
```json
{
  "success": true,
  "data": {
    "totalDocuments": 0,
    "totalChunks": 0,
    "totalSize": 0
  }
}
```

(These numbers will increase after you upload documents)

### 4. Check search statistics:
```bash
curl http://localhost:3001/api/admin/stats/search
```

Should return statistics about indexed chunks and search performance.

## Troubleshooting

### Port already in use?

If you see errors about ports 3000, 3001, or 5432 already being used:

```bash
# Find what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Stop those services or edit docker-compose.yml to use different ports
```

### API key errors?

1. Verify your API keys are correct in `.env`
2. Make sure you didn't include quotes around the API keys
3. Check your Anthropic account at https://console.anthropic.com/
4. Check your OpenAI account at https://platform.openai.com/account/billing
5. Restart services:
   ```bash
   docker compose restart
   ```

### Database not initializing?

**Error: `database "docsagent" does not exist`**

Your `.env` file has the wrong database name:

```bash
# Fix in .env - change this:
POSTGRES_DB=docsagent  # ❌ Wrong (no underscore)

# To this:
POSTGRES_DB=docs_agent  # ✅ Correct (WITH underscore!)

# Then recreate the database:
docker compose down -v
docker compose up -d
```

**Other database issues:**

The database initializes automatically on first startup. If you see errors:

```bash
# Check database logs
docker compose logs database

# Try resetting the database
docker compose down -v
docker compose up -d
```

### Services not starting?

```bash
# Check logs for errors
docker compose logs

# Try rebuilding
docker compose down
docker compose up -d --build
```

### Fresh start?

To completely reset everything and start from scratch:

```bash
# WARNING: This deletes all data including uploaded documents!
docker compose down -v
docker compose up -d --build
```

## Cost Considerations

### API Usage

- **Document Processing**: ~$0.001-0.01 per document (depending on size)
  - Generates embeddings for document chunks
  - One-time cost per document
  
- **Per Chat Message**: ~$0.01-0.05 (depending on model and context)
  - Uses Claude Sonnet 3.5 for chat responses
  - Retrieves relevant documentation chunks

**Tip:** You can change the Claude model in `.env` to use a cheaper option:
```env
CLAUDE_MODEL=claude-3-haiku-20240307  # Faster and cheaper
```

### Free Alternatives for Learning

If you want to experiment without spending money:
1. Upload a small test document first
2. Ask a few questions to understand the system
3. Delete the document before uploading more
4. Each document only costs money once during upload

## What's Next?

### Add Your Own Documents

**Via the UI:**
1. Open http://localhost:3000
2. Drag and drop Markdown or OpenAPI spec files
3. Wait for processing
4. Start chatting!

**Via the API:**
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@path/to/your/documentation.md"
```

Supported formats:
- **Markdown** (.md) - Documentation, guides, READMEs
- **OpenAPI** (.json, .yaml) - API specifications

### Customize the UI

Edit colors in `frontend/src/app/globals.css`:

```css
.dark {
  --primary: 262 83% 58%;  /* Change purple */
  --accent: 180 100% 50%;   /* Change cyan */
}
```

### Tune RAG Parameters

Edit `backend/src/services/ragService.ts` to adjust:
- Number of chunks retrieved
- Similarity threshold
- Cache duration
- Reranking weights

### Deploy to Production

Ready to deploy to Render? See the main [README.md](./README.md#-deploy-to-render) for:
- **Render.com**: One-click deployment using the included `render.yaml`
- **Blueprint setup**: Automatically creates database, backend, and frontend
- **Environment variables**: Production configuration guide

**Quick deploy to Render:**
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Select your repository
5. Add your API keys
6. Deploy!

## Need Help?

- **API Documentation**: See [backend/API.md](./backend/API.md)
- **Full README**: See [README.md](./README.md) for complete documentation
- **Troubleshooting**: See the [Troubleshooting section](./README.md#-troubleshooting) in README

## Common Questions

**Q: What's the difference between this and other chatbots?**

A: This is a RAG (Retrieval-Augmented Generation) system specifically designed for documentation. It doesn't just chat - it searches your uploaded docs and provides accurate, cited answers from your content.

**Q: Can I use a different database?**

A: This project requires PostgreSQL with the pgvector extension for vector similarity search. It's optimized for this stack.

**Q: Can I use a different AI provider?**

A: Currently uses Claude (Anthropic) for chat and OpenAI for embeddings. Adding other providers would require code changes.

**Q: How does the RAG pipeline work?**

A: When you ask a question:
1. Your question is converted to a vector embedding
2. The system searches for similar documentation chunks
3. Relevant chunks are assembled into context
4. Claude generates an answer using that context
5. You get an accurate answer with source citations

**Q: How do I change the AI model?**

A: Edit `.env` and change `CLAUDE_MODEL` or `EMBEDDING_MODEL`:
```env
CLAUDE_MODEL=claude-3-haiku-20240307  # Cheaper/faster
CLAUDE_MODEL=claude-3-opus-20240229   # More powerful
```

**Q: Is my API key secure?**

A: Yes! The API keys are only stored in your local `.env` file and environment variables. Never commit `.env` to Git! (It's in `.gitignore` by default)

**Q: How do I update the code?**

A: Pull the latest changes and rebuild:
```bash
git pull
docker compose up -d --build
```

**Q: Can I upload multiple documents?**

A: Yes! Upload as many as you want. The system will search across all uploaded documents when answering questions.

**Q: What happens if I upload a document twice?**

A: The system will create a new entry. You may want to delete the old one first to avoid duplicates.

**Q: How do I delete documents?**

A: Use the delete button in the UI or call the API:
```bash
curl -X DELETE http://localhost:3001/api/documents/{documentId}
```

**Q: Can I use this for non-documentation content?**

A: Yes! While optimized for docs, it works with any text content. Just upload your content as Markdown files.

## Performance Tips

1. **Vector indexes** - Already created automatically for fast searches
   
2. **Upload quality docs** - Well-structured documentation = better answers
   - Use clear headings
   - Include code examples
   - Keep sections focused

3. **Ask specific questions** - More specific = more accurate answers
   - ❌ "Tell me about the API"
   - ✅ "How do I authenticate API requests?"

4. **Monitor responses** - Check source citations to verify accuracy

5. **Optimize embeddings** - Reduce costs by using smaller embedding models:
   ```env
   EMBEDDING_MODEL=text-embedding-3-small  # Default, good balance
   ```

## Advanced Usage

### Check Search Performance

```bash
curl http://localhost:3001/api/admin/stats/search
```

Returns detailed statistics about indexed chunks and search performance.

### Clear RAG Cache

```bash
curl -X POST http://localhost:3001/api/admin/cache/clear
```

Clears the query cache to save memory or force fresh results.

### Create Vector Index

```bash
curl -X POST http://localhost:3001/api/admin/index/create
```

Creates/rebuilds the HNSW index for faster searches (usually automatic).

### View Chat Sessions

```bash
curl http://localhost:3001/api/admin/sessions
```

Lists all active chat sessions.

---

**That's it!** You now have a production-ready AI docs agent running locally. Upload your docs and start chatting! 🎉

**Ready for production?** → See [README.md](./README.md#-deploy-to-render) to deploy to Render.com

