FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/ngo-backend-1.0.0.jar ./app.jar
ENV PORT=8080
ENV DATA_DIR=/var/data
ENV SPRING_WEB_RESOURCES_STATIC_LOCATIONS=classpath:/static/
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
