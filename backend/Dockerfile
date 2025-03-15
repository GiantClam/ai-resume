# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /build

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o reumeai .

# Final stage
FROM alpine:latest

# Add necessary packages
RUN apk add --no-cache ca-certificates tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# Create non-root user
RUN adduser -D -g '' appuser

# Create necessary directories
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/reumeai .

# Copy environment configuration
COPY .env.production .env

# Copy any additional required files (if needed)
# COPY configs/ configs/

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8180

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8180/health || exit 1

# Run the application
CMD ["./reumeai"] 