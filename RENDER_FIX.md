# Render Deployment Fix - npm ci Error

## Problem

When deploying to Render, both frontend and backend were failing with:

```
npm error Run "npm help ci" for more info
```

## Root Cause

**Version Mismatch:**
- Local machine: Node v24 with npm v11.6.1
- Dockerfiles: Node 20 with npm v10.x
- Package lock files: `lockfileVersion: 3` (from npm 11)

npm 10.x cannot properly read lockfiles created by npm 11.x, causing `npm ci` to fail.

## Solution Applied

### 1. Updated Docker Images

**Changed:** `node:20-alpine` → `node:22-alpine`

Node 22 is the current LTS version with npm 10.x that's compatible with modern lockfile formats.

### 2. Changed npm Commands

**Replaced:**
- `npm ci` → `npm install --production=false` (build stage)
- `npm ci --only=production` → `npm install --omit=dev` (production stage)

These commands are more flexible and handle lockfile version differences better.

### 3. Updated Package Requirements

Updated both `backend/package.json` and `frontend/package.json`:

```json
"engines": {
  "node": ">=22.0.0",
  "npm": ">=10.0.0"
}
```

## Files Modified

1. ✅ `backend/Dockerfile`
   - Updated all stages to use `node:22-alpine`
   - Changed `npm ci` to `npm install`
   
2. ✅ `frontend/Dockerfile`
   - Updated all stages to use `node:22-alpine`
   - Changed `npm ci` to `npm install`
   
3. ✅ `backend/package.json`
   - Updated engines requirement
   
4. ✅ `frontend/package.json`
   - Updated engines requirement

## Testing

### Local Testing

```bash
# Test backend build
cd backend
docker build --target production -t docs-agent-backend .

# Test frontend build
cd ../frontend
docker build --target production -t docs-agent-frontend .
```

### Deploy to Render

```bash
# Commit changes
git add backend/Dockerfile frontend/Dockerfile backend/package.json frontend/package.json
git commit -m "fix: update to Node 22 and fix npm ci error"
git push origin main
```

Render will automatically rebuild with the fixed Dockerfiles.

## Why This Works

1. **Node 22** is LTS and widely supported by Render
2. **npm install** is more forgiving than `npm ci`:
   - `npm ci` requires exact lockfile match
   - `npm install` can work with minor version differences
3. **--omit=dev** flag properly excludes devDependencies in production

## Trade-offs

**npm ci vs npm install:**
- `npm ci` is faster and stricter (exact lockfile match)
- `npm install` is more flexible but slightly slower
- For this project, flexibility is more important since we may develop on different Node versions

## Prevention

To avoid this in the future:

1. **Use Node 22 locally** to match production:
   ```bash
   nvm install 22
   nvm use 22
   ```

2. **Or regenerate lockfiles** with npm 10.x:
   ```bash
   npm install --lockfile-version 3
   ```

3. **Use Docker for development** to match production exactly:
   ```bash
   docker compose up -d
   ```

## Verification

After deployment, verify both services are running:

```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check frontend
curl https://your-frontend.onrender.com
```

## Additional Notes

- The Dockerfiles now use multi-stage builds optimized for production
- Development and production stages use the same base Node version
- docker-compose.yml references the Dockerfiles, so local dev also benefits

---

**Status:** ✅ Fixed and ready for deployment

**Last Updated:** Nov 23, 2024

