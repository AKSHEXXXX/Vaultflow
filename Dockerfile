# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build
# Uses the full Maven + JDK image to compile and package the fat JAR.
# The .m2 cache is kept inside the build layer so it doesn't leak to runtime.
# ─────────────────────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy dependency manifest first — allows Docker layer caching to skip the
# mvn dependency:go-offline step on subsequent builds when only source changes.
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -q

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Runtime
# Minimal JRE image; no build tooling shipped to production.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy AS runtime

# Non-root user for security
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=builder /build/target/saas-*.jar app.jar

# Give ownership to non-root user
RUN chown appuser:appgroup app.jar

USER appuser

# Expose backend port
EXPOSE 8080

# Health check — calls the Spring Actuator health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# SPRING_PROFILES_ACTIVE is injected via docker-compose env_file / -e flag.
# Defaults to 'prod' so an unset var still boots securely.
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
