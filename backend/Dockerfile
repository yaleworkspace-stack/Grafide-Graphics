# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy configuration files
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

# Grant execute permission
RUN chmod +x mvnw

# Copy source code
COPY backend/src src

# Perform a standard build (skipping tests to speed up the process)
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]