# Test Documentation

This directory contains sample documentation files for testing the Docs Agent.

## Files

- `example-api.md` - Comprehensive API documentation with authentication, endpoints, and examples
- `getting-started.md` - User onboarding guide with setup instructions and tutorials

## How to Test

### Using the UI

1. Start the application:
   ```bash
   make up
   ```

2. Open http://localhost:3000

3. Upload one of these test files using the sidebar

4. Ask questions like:
   - "How do I authenticate with the API?"
   - "What endpoints are available?"
   - "How do I create a new user?"
   - "Show me how to deploy my first app"
   - "What are the rate limits?"

### Using cURL

Upload a document:

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@test-docs/example-api.md"
```

Get all documents:

```bash
curl http://localhost:3001/api/documents
```

Delete a document:

```bash
curl -X DELETE http://localhost:3001/api/documents/DOCUMENT_ID
```

## Expected Behavior

After uploading a document, the system should:

1. ✅ Parse the Markdown content
2. ✅ Split it into semantic chunks
3. ✅ Generate embeddings for each chunk
4. ✅ Store everything in PostgreSQL
5. ✅ Make it searchable via chat

You should then be able to ask questions and get accurate answers with source citations.

## Creating Your Own Test Docs

To add your own documentation:

1. Create a `.md` file with your content
2. Use clear headings to structure sections
3. Include code examples where relevant
4. Upload through the UI or API

The more structured and detailed your documentation, the better the AI responses will be!

