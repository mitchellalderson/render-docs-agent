# Render Docs Agent

An AI-powered documentation agent that helps users interact with their product documentation through natural language chat. Built with advanced RAG (Retrieval-Augmented Generation) using Claude AI and vector search.

## 🚀 New? Start Here!

**Want to run this locally in 5 minutes?** → Just run:

```bash
./start-docker.sh
```

The automated script will guide you through setup and start everything automatically!

---

## Table of Contents

- [Deploy to Render](#-deploy-to-render)
- [Features](#-features)
- [Repository Structure](#-repository-structure)
- [Quick Start with Docker](#-quick-start-with-docker)
- [Docker Commands](#-docker-commands)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Deploy to Render

This project is pre-configured for one-click deployment to [Render](https://render.com/) using the included `render.yaml` blueprint.

**What you get:**

- ✅ Automatic database migrations on deployment
- ✅ Automatic vector index creation
- ✅ PostgreSQL with pgvector extension
- ✅ Auto-scaling and health checks
- ✅ Separate backend and frontend services
- ✅ Environment variable management

**Deployment steps:**

1. **Fork this repository to your GitHub account**

2. **Create a new Blueprint Instance on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint Instance"
   - Connect your forked repository
   - Select branch (usually `main`)

3. **Configure environment variables:**
   - Render will auto-detect `render.yaml`
   - You'll be prompted to enter:
     - `ANTHROPIC_API_KEY` ([Get one here](https://console.anthropic.com/))
     - `OPENAI_API_KEY` ([Get one here](https://platform.openai.com/api-keys))
   - All other variables are pre-configured

4. **Deploy:**
   - Click "Apply" to create all services
   - Render will:
     - Create PostgreSQL database with pgvector
     - Build and deploy backend with automatic migrations
     - Automatically create vector indexes
     - Build and deploy frontend
     - Link services together

5. **Access your deployed app:**
   - Frontend: `https://your-app-name-frontend.onrender.com`
   - Backend API: `https://your-app-name-backend.onrender.com`

**Cost Estimate (Render Free Tier):**

- 2 Web Services (frontend + backend): Free
- 1 PostgreSQL Database: Free (with limitations)
- OpenAI/Anthropic API: Pay-as-you-go (minimal for embeddings)
- Total: ~$0/month recurring (with free tier limitations)

## ✨ Features

- 🤖 **RAG-Powered Responses** - Semantic search over documentation using vector embeddings
- 💬 **Conversation History** - Persistent multi-turn conversations with context awareness
- 📚 **Source Citations** - Shows which documents informed each response
- 🎯 **Real-time Confidence Scores** - Visual indication of answer quality
- 📄 **Document Upload** - Upload Markdown files & OpenAPI specifications
- ⚡ **Lightning-Fast Search** - HNSW indexing for 10-100x performance boost
- 🎨 **Beautiful Dark Mode UI** - Inspired by Render.com's design system
- 📱 **Mobile Responsive** - Full functionality on all screen sizes
- ♿ **Accessibility Features** - ARIA labels, keyboard navigation, screen reader support
- 🚀 **Easy Deployment** - One-click Render.com deployment

## 📁 Repository Structure

```
.
├── backend/              # Express + TypeScript API
│   ├── src/
│   │   ├── services/     # RAG, embedding, Claude AI services
│   │   ├── routes/       # API endpoints (chat, documents, admin)
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Rate limiting, validation, error handling
│   │   ├── utils/        # Markdown/OpenAPI parsers, context builder
│   │   └── scripts/      # Database initialization scripts
│   ├── prisma/
│   │   ├── schema.prisma # Database schema with pgvector
│   │   └── migrations/   # Database migrations
│   ├── Dockerfile        # Production container with auto-migrations
│   └── API.md           # Complete API documentation
├── frontend/             # Next.js 14 + React app
│   ├── src/
│   │   ├── components/   # Chat UI, document management
│   │   │   ├── chat/     # Chat interface components
│   │   │   ├── layout/   # Header, sidebar
│   │   │   └── ui/       # shadcn/ui components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # API client, utilities
│   ├── Dockerfile        # Nginx-served production build
│   └── nginx.conf        # Nginx configuration
├── test-docs/            # Sample documentation files
├── docker-compose.yml    # Full-stack local development
├── render.yaml           # Production deployment configuration
├── Makefile             # Development shortcuts
└── README.md            # This file
```

## 🚀 Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- [Anthropic API key](https://console.anthropic.com/)
- [OpenAI API key](https://platform.openai.com/api-keys)

### Option 1: Automated Script (Recommended)

```bash
# Clone the repo
git clone <your-repo-url>
cd render-docs-agent

# Run the automated setup script
./start-docker.sh
```

The script will:
1. ✅ Create `.env` file if missing
2. ✅ Prompt for your API keys
3. ✅ Start all services (database, backend, frontend)
4. ✅ Run database migrations automatically
5. ✅ Create vector indexes for fast search
6. ✅ Verify everything is working

### Option 2: Manual Setup

```bash
# 1. Clone and navigate
git clone <your-repo-url>
cd render-docs-agent

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and add your API keys
# Required:
#   ANTHROPIC_API_KEY=sk-ant-your-actual-key
#   OPENAI_API_KEY=sk-your-actual-key

# 4. Start all services
docker-compose up -d

# 5. Wait for initialization (30-60 seconds)
# Migrations and indexes are created automatically
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Database:** localhost:5432

### Upload Documentation

1. Open http://localhost:3000
2. Drag and drop a Markdown file or OpenAPI spec
3. Wait for processing (~10-30 seconds)
4. Start chatting!

**Try the test documents:**

```bash
# Upload via UI or via API
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@test-docs/example-api.md"
```

## 📦 Docker Commands

**Start all services:**

```bash
docker-compose up -d
```

**Stop all services:**

```bash
docker-compose down
```

**View logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

**Rebuild after code changes:**

```bash
docker-compose up -d --build
```

**Clean restart (removes all data):**

```bash
docker-compose down -v
docker-compose up -d --build
```

**Useful make commands:**

```bash
make help         # Show all available commands
make up           # Start services
make down         # Stop services
make logs         # View all logs
make logs-backend # Backend logs only
make restart      # Restart all services
make db-migrate   # Run database migrations
make db-studio    # Open Prisma Studio
make clean        # Clean everything
```

## 📝 Environment Variables

### Backend (.env)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | Yes | - |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment | No | development |
| `CLAUDE_MODEL` | Claude model to use | No | claude-3-5-sonnet-20241022 |
| `EMBEDDING_MODEL` | Embedding model | No | text-embedding-3-small |
| `CLAUDE_MAX_TOKENS` | Max tokens for responses | No | 4096 |
| `CLAUDE_TEMPERATURE` | Response creativity (0-1) | No | 0.3 |

### Frontend (.env.local)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | - |
| `NEXT_PUBLIC_APP_NAME` | Application name | No | Docs Agent |

### Docker Compose (.env)

All variables are documented in `.env.example`. Just copy it and add your API keys!

## 📊 API Endpoints

### Documents

- `POST /api/documents/upload` - Upload documentation
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats` - Document statistics

### Chat

- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/history/:sessionId` - Get chat history

### Admin

- `POST /api/admin/index/create` - Create vector index
- `GET /api/admin/stats/search` - Search statistics
- `POST /api/admin/cache/clear` - Clear RAG cache
- `GET /api/admin/sessions` - List active sessions
- `DELETE /api/admin/sessions/:id` - Clear session

### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Comprehensive status with database info
- `GET /health/ready` - Readiness probe (for Kubernetes)
- `GET /health/live` - Liveness probe (for Kubernetes)

**Complete API documentation:** See `backend/API.md`

## 🧪 Testing

### Quick Test

```bash
# 1. Upload a document
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@test-docs/example-api.md"

# 2. Test chat
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I authenticate?"}'

# 3. Check performance stats
curl http://localhost:3001/api/admin/stats/search

# 4. Create vector index for faster search
curl -X POST http://localhost:3001/api/admin/index/create
```

### UI Testing

1. **Upload Test:**
   - Open http://localhost:3000
   - Drag `test-docs/example-api.md` into sidebar
   - Verify document appears in list

2. **Chat Test:**
   - Click a suggested question OR
   - Type "How do I authenticate?"
   - Verify response with source citations
   - Check confidence score

3. **Features Test:**
   - Copy code blocks
   - Clear conversation
   - Test on mobile (resize browser)
   - Try keyboard navigation (Tab, Enter, Escape)

### Automated Testing

```bash
cd backend
npm test
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker-compose ps

# View database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

### API Key Errors

```bash
# Verify keys are set
cat .env | grep API_KEY

# Restart backend to pick up changes
docker-compose restart backend
```

### Slow Responses

```bash
# Create vector index (10-100x faster searches)
curl -X POST http://localhost:3001/api/admin/index/create

# Check index was created
curl http://localhost:3001/api/admin/stats/search
```

### Port Conflicts

If ports 3000, 3001, or 5432 are already in use:

1. Stop the conflicting service, OR
2. Edit `docker-compose.yml` to use different ports:

```yaml
ports:
  - "3002:3001"  # Backend on 3002
  - "3001:3000"  # Frontend on 3001
  - "5433:5432"  # Database on 5433
```

### Docker Issues

```bash
# Full clean rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d --build

# Check service status
docker-compose ps

# Check specific service logs
docker-compose logs -f backend
```

### Frontend Can't Reach Backend

**Check CORS configuration:**

```bash
# Verify FRONTEND_URL matches
cat .env | grep FRONTEND_URL

# Verify NEXT_PUBLIC_API_URL is correct
cat .env | grep NEXT_PUBLIC_API_URL

# Restart both services
docker-compose restart backend frontend
```

**Getting more help:**

1. Check service logs: `docker-compose logs <service-name>`
2. Verify environment variables are set correctly
3. Ensure all containers are healthy: `docker-compose ps`
4. Check the `backend/API.md` for endpoint details

## 🎯 Key Features Explained

### RAG (Retrieval-Augmented Generation)

The agent uses advanced RAG to provide accurate answers:

1. **Query Processing** - User question converted to vector embedding
2. **Semantic Search** - Find relevant documentation chunks using cosine similarity
3. **Context Building** - Assemble context with intelligent token management
4. **AI Generation** - Claude generates answer with source citations
5. **Response** - User gets accurate answer with confidence score

**Performance:**

- Vector search: ~20-50ms with HNSW indexing
- Cached queries: <5ms
- End-to-end: ~1-2 seconds (including Claude API)

### Vector Search

- **HNSW Indexing** - 10-100x faster than naive search
- **Cosine Similarity** - Measures semantic relevance
- **Dynamic Thresholds** - Auto-adjusts for better results
- **Reranking** - Combines semantic + keyword + position scoring
- **Caching** - 5-minute TTL for repeated queries

### Context Management

- **Token Counting** - Prevents context overflow
- **Smart Truncation** - Includes most relevant chunks first
- **Source Attribution** - Every chunk tagged with source document
- **History Integration** - Balances documentation context vs conversation history

## 🎨 Customization

### UI Colors

Edit `frontend/src/app/globals.css`:

```css
.dark {
  --primary: 262 83% 58%;  /* Purple */
  --accent: 180 100% 50%;  /* Cyan */
}
```

### RAG Parameters

Edit backend code or environment variables:

```typescript
// Backend configuration
defaultTopK: 10          // Number of chunks to retrieve
defaultThreshold: 0.5    // Similarity threshold (0-1)
cacheTTL: 5 * 60 * 1000 // Cache duration (5 minutes)

// Claude configuration
temperature: 0.3         // Response creativity (0-1)
maxTokens: 4096         // Max response length
```

## 📈 Performance Tips

1. **Create vector index** - 10-100x faster searches

   ```bash
   curl -X POST http://localhost:3001/api/admin/index/create
   ```

2. **Upload quality docs** - Better structure = better answers

3. **Use specific questions** - More specific = more accurate

4. **Monitor confidence** - Low scores may indicate missing documentation

## 🔍 Monitoring

### Check Search Performance

```bash
curl http://localhost:3001/api/admin/stats/search
```

Returns:

- Total chunks in database
- Chunks with embeddings
- Index coverage percentage
- Cache size

### View Chat Metadata

Every chat response includes:

```json
{
  "confidence": 85.4,
  "metadata": {
    "documentCount": 2,
    "chunkCount": 7,
    "processingTime": 1243,
    "usage": {
      "inputTokens": 3421,
      "outputTokens": 542
    }
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test locally with Docker Compose
5. Commit changes: `git commit -am 'Add my feature'`
6. Push to branch: `git push origin feature/my-feature`
7. Submit a Pull Request

## 📄 License

MIT

## 💬 Support

- **Issues:** Open a GitHub issue for bugs or questions
- **Render Support:** support@render.com

---

**Built with ❤️ for Render.com**

Get started in 5 minutes with `./start-docker.sh`!
