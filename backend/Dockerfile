FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY NgoServer.java .
RUN javac -d out NgoServer.java

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/out ./out
ENV PORT=8080
ENV DATA_DIR=/var/data
EXPOSE 8080
CMD ["sh", "-c", "java -cp out backend.NgoServer"]
