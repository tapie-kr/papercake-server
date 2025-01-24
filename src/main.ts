import app from "./app";

const SERVER_PORT = Number(process.env.SERVER_PORT) || 443;

async function bootstrap() {
  try {
    await app.listen({ port: SERVER_PORT, host: "0.0.0.0" });
    console.log("Listening on port " + SERVER_PORT);
  } catch (err) {
    app.log.error(`Server Error: ${err}`);
    process.exit(1);
  }
}

bootstrap();
