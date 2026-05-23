# Backend

Express API for the Programming Practice Assistant MVP.

Current routes:

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/ai/explain`
- `POST /api/ai/generate`
- `GET /api/snippets`
- `POST /api/snippets`
- `GET /api/snippets/:id`
- `DELETE /api/snippets/:id`

The backend uses Groq for AI and MongoDB/Mongoose with JWT auth for users and saved snippets.
