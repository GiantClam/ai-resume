# AI Resume

AI Resume is a web application that helps automate HR processes such as resume screening, interview question generation, and interview summary creation. The application consists of a Next.js frontend and a Go backend.

## Project Structure

- `app/`: Next.js application pages and layouts
- `components/`: React components for the UI
- `backend/`: Go backend API services
- `lib/`: Utility functions and helpers
- `public/`: Static assets

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Go (v1.20 or higher)
- Google Cloud Platform account with Vertex AI API enabled

## Setup and Installation

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the project root with the following variables (see `.env.example` for a template):
   ```
   NEXT_PUBLIC_API_URL=<backend_api_url>
   ```

3. Build the frontend:
   ```
   npm run build
   ```

4. Start the frontend server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Go dependencies:
   ```
   go mod download
   ```

3. Create a Google Cloud service account key and save it in a secure location.

4. Copy `.env.example` to `.env` and update with your configuration:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to set your Google Cloud project ID and the path to your service account key.

5. Build and run the backend:
   ```
   go build -o ai-resume-backend main.go
   ./ai-resume-backend
   ```

## Security Considerations

### Sensitive Information

The project contains several files with sensitive information that should **not** be committed to version control:

1. **Google Cloud Service Account Keys (`*.json`)**: These files contain private keys that could be used to access your Google Cloud resources.

2. **Environment Files (`.env`)**: These files contain configuration variables that may include API keys, project IDs, and other sensitive information.

To protect sensitive information:

- Never commit `.env` files or service account keys to version control
- Use the provided `.env.example` files as templates
- For production deployments, use environment variables or secrets management services
- Review `.gitignore` to ensure sensitive files are excluded

### Local Development

For local development, create your own `.env` files based on the `.example` templates provided, and place your service account key in a secure location that is not tracked by Git.

## Deployment

### Frontend Deployment

1. Build the production version of the frontend:
   ```
   npm run build
   ```

2. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

### Backend Deployment

1. Build the Go binary for your target platform:
   ```
   go build -o ai-resume-backend main.go
   ```

2. Deploy the binary to your server or container platform of choice.

3. Ensure the service account credentials are properly set up in your deployment environment.

## Features

- **Resume Screening**: Upload resumes for AI analysis
- **Interview Question Generation**: Generate customized interview questions based on job requirements
- **Interview Summary**: Create comprehensive interview summaries

## License

[Add license information here]

## Contact

[Add contact information here] 