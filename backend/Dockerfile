# Use OpenJDK 21 slim image
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first for better caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check (simplified)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD java -cp target/classes com.groceryapp.backend.BackendApplication --version || exit 1

# Run the application
CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
