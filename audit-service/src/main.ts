import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const tcpPort = parseInt(process.env.TCP_PORT ?? "3003", 10);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0", 
      port: tcpPort,
    },
  });

  await app.startAllMicroservices();

  const httpPort = parseInt(process.env.PORT ?? "3002", 10);
  await app.listen(httpPort);

  console.log(`🚀 Audit HTTP  → http://localhost:${httpPort}`);
  console.log(`📡 Audit TCP   → port ${tcpPort}`);
}

bootstrap();
