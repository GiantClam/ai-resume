# Deployment Guide for AI Resume

This document provides detailed instructions for deploying the AI Resume application to various environments. The application consists of a Next.js frontend and a Go backend.

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Go (v1.20 or higher)
- Google Cloud Platform account with Vertex AI API enabled
- A service account with necessary permissions for Vertex AI

## Local Deployment

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Go dependencies:
   ```bash
   go mod download
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8080
   CORS_ORIGIN=http://localhost:3000
   ```

4. Set up Google Cloud credentials:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=path/to/your-service-account-key.json
   ```

5. Run the backend server:
   ```bash
   go run main.go
   ```

## Production Deployment

### Frontend Deployment to Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

5. Configure environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed backend API

### Backend Deployment to Google Cloud Run

1. Build the Docker container:
   ```bash
   cd backend
   docker build -t gcr.io/[PROJECT_ID]/ai-resume-backend .
   ```

2. Push the container to Google Container Registry:
   ```bash
   docker push gcr.io/[PROJECT_ID]/ai-resume-backend
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy ai-resume-backend \
     --image gcr.io/[PROJECT_ID]/ai-resume-backend \
     --platform managed \
     --region [REGION] \
     --allow-unauthenticated
   ```

4. Set environment variables in Cloud Run:
   - `CORS_ORIGIN`: URL of your frontend application
   - (Service account credentials are automatically configured in Cloud Run)

## Docker Deployment

### Using Docker Compose

1. Create a `docker-compose.yml` file in the project root:
   ```yaml
   version: '3'
   services:
     frontend:
       build: 
         context: .
         dockerfile: Dockerfile.frontend
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://backend:8080
       depends_on:
         - backend
   
     backend:
       build: 
         context: ./backend
         dockerfile: Dockerfile
       ports:
         - "8080:8080"
       environment:
         - CORS_ORIGIN=http://frontend:3000
       volumes:
         - ./your-service-account-key.json:/app/credentials.json
       environment:
         - GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
   ```

2. Create `Dockerfile.frontend` in the project root:
   ```Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. Create `Dockerfile` in the backend directory:
   ```Dockerfile
   FROM golang:1.20-alpine
   WORKDIR /app
   COPY go.mod go.sum ./
   RUN go mod download
   COPY . .
   RUN go build -o main .
   EXPOSE 8080
   CMD ["./main"]
   ```

4. Start the application with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Security Considerations

1. **Service Account Keys**: Ensure that Google Cloud service account keys are properly secured and not committed to version control.

2. **Environment Variables**: Use environment variables for sensitive configuration and credentials.

3. **CORS Configuration**: Configure CORS in the backend to only allow requests from trusted origins.

4. **API Rate Limiting**: Consider implementing rate limiting for the backend API to prevent abuse.

## Monitoring and Maintenance

1. Set up logging and monitoring for both frontend and backend components.

2. Implement regular backup procedures for any persistent data.

3. Establish a CI/CD pipeline for automated testing and deployment.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend's CORS settings match the frontend's origin.

2. **Authentication Errors**: Verify Google Cloud service account permissions and key validity.

3. **Backend Connection Issues**: Check network configurations and firewall rules.

For additional assistance, refer to the project's documentation or contact the development team. 