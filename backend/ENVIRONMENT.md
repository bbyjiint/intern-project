## Backend environment variables

### Required
- **`DATABASE_URL`**: PostgreSQL connection string used by Prisma.
- **`JWT_SECRET`**: Secret used to sign your app JWTs.

### Optional
- **`OAUTH_STATE_SECRET`**: Secret used to sign OAuth `state` values (defaults to `JWT_SECRET`).

### Google OAuth
- **`GOOGLE_CLIENT_ID`**
- **`GOOGLE_CLIENT_SECRET`** (required only for redirect-based flow)
- **`GOOGLE_REDIRECT_URI`**: Must match the Google OAuth client redirect URI, e.g. `http://localhost:5000/api/auth/google/callback`

### LINE Login OAuth
- **`LINE_CHANNEL_ID`**
- **`LINE_CHANNEL_SECRET`** (required only for redirect/code exchange flows)
- **`LINE_REDIRECT_URI`**: Must match the LINE Login Callback URL, e.g. `http://localhost:5000/api/auth/line/callback`

### Auth endpoints added

- **Google**
  - `POST /api/auth/google` `{ "idToken": "..." }`
  - `GET /api/auth/google/start?returnTo=...`
  - `GET /api/auth/google/callback`

- **LINE**
  - `POST /api/auth/line` `{ "idToken": "..." }`
  - `GET /api/auth/line/start?returnTo=...`
  - `GET /api/auth/line/callback`
  - `POST /api/auth/line/code` `{ "code": "...", "redirectUri": "..." }`

