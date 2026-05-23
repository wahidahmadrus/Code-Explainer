# Code Explainer

A programming practice assistant that helps beginners understand code and generate simple examples from English instructions.

## Production Link

Live app: https://wahidcodeexplainer.netlify.app/

## What The App Does

Code Explainer has two main practice modes:

- `Explain Code` - choose a language, paste or write code, and get a beginner-friendly explanation with a summary, line-by-line notes, key concepts, common mistakes, and improved code when helpful.
- `Generate Code` - choose a language, describe what you want to build in English, and get clean starter code with a short explanation.

The app is built to help learners read code more confidently without running user code on the backend.

## Project Structure

- `frontend` - the user-facing React app
- `admin` - the admin dashboard for managing users, snippets, AI requests, and supported languages
- `backend` - the Express API for auth, AI requests, snippets, and admin tools

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Monaco Editor
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth
- AI: Groq through the OpenAI-compatible SDK
- Deployment: Netlify for the frontend, Render for the backend
