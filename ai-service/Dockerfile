# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Create models directory and set permissions
RUN mkdir -p models && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check (using curl)
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run the startup script
CMD ["./start.sh"]