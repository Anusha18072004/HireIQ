# Build stage using Maven and Java 17
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Run stage using OpenJDK 17-slim
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/hireiq-0.0.1-SNAPSHOT.jar hireiq.jar
# Expose the port configured in application.properties
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "hireiq.jar"]
