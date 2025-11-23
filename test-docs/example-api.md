# API Documentation

## Overview

This is a sample API documentation to test the Docs Agent. It covers authentication, endpoints, and error handling.

## Authentication

All API requests require authentication using an API key. Include your API key in the `Authorization` header:

```bash
Authorization: Bearer YOUR_API_KEY
```

### Getting an API Key

1. Sign up for an account
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Copy and securely store your key

## Base URL

```
https://api.example.com/v1
```

## Endpoints

### GET /users

Retrieve a list of users.

**Parameters:**
- `limit` (optional): Number of users to return (default: 10, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example Request:**
```bash
curl -X GET "https://api.example.com/v1/users?limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Example Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### POST /users

Create a new user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "member"
}
```

**Example Request:**
```bash
curl -X POST "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "jane@example.com"}'
```

**Example Response:**
```json
{
  "id": "user_456",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "member",
  "created_at": "2024-01-20T14:25:00Z"
}
```

### GET /users/:id

Retrieve a specific user by ID.

**Parameters:**
- `id` (required): User ID

**Example Request:**
```bash
curl -X GET "https://api.example.com/v1/users/user_123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### PUT /users/:id

Update a user's information.

**Parameters:**
- `id` (required): User ID

**Request Body:**
```json
{
  "name": "John Updated",
  "role": "admin"
}
```

### DELETE /users/:id

Delete a user.

**Parameters:**
- `id` (required): User ID

**Example Request:**
```bash
curl -X DELETE "https://api.example.com/v1/users/user_123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": {
    "code": "invalid_request",
    "message": "The 'email' field is required",
    "details": {}
  }
}
```

## Rate Limiting

API requests are limited to:
- **100 requests per minute** for authenticated requests
- **20 requests per minute** for unauthenticated requests

When you exceed the rate limit, you'll receive a `429` status code with a `Retry-After` header.

## Webhooks

Set up webhooks to receive real-time notifications about events.

### Configuring Webhooks

1. Go to Settings > Webhooks
2. Click "Add Webhook"
3. Enter your endpoint URL
4. Select events to subscribe to
5. Save and test

### Webhook Events

- `user.created` - Triggered when a new user is created
- `user.updated` - Triggered when a user is updated
- `user.deleted` - Triggered when a user is deleted

**Webhook Payload Example:**
```json
{
  "event": "user.created",
  "timestamp": "2024-01-20T15:30:00Z",
  "data": {
    "id": "user_789",
    "name": "New User",
    "email": "newuser@example.com"
  }
}
```

## SDK Support

Official SDKs are available for:

- **JavaScript/TypeScript**: `npm install @example/api-client`
- **Python**: `pip install example-api`
- **Ruby**: `gem install example-api`
- **Go**: `go get github.com/example/api-go`

### JavaScript Example

```javascript
import { ExampleAPI } from '@example/api-client';

const client = new ExampleAPI({ apiKey: 'YOUR_API_KEY' });

// Get users
const users = await client.users.list({ limit: 10 });

// Create user
const newUser = await client.users.create({
  name: 'Jane Smith',
  email: 'jane@example.com'
});
```

### Python Example

```python
from example_api import ExampleAPI

client = ExampleAPI(api_key='YOUR_API_KEY')

# Get users
users = client.users.list(limit=10)

# Create user
new_user = client.users.create(
    name='Jane Smith',
    email='jane@example.com'
)
```

## Support

Need help? Contact us:

- **Email**: support@example.com
- **Docs**: https://docs.example.com
- **Community**: https://community.example.com
- **Status**: https://status.example.com

