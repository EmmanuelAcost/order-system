import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const tcpPort = parseInt(process.env.TCP_PORT ?? "3001", 10);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { host: "0.0.0.0", port: tcpPort },
  });

  await app.startAllMicroservices();

  const httpPort = parseInt(process.env.PORT ?? "3000", 10);
  await app.listen(httpPort);

  console.log(`🚀 Orders HTTP  → http://localhost:${httpPort}`);
  console.log(`📡 Orders TCP   → port ${tcpPort}`);
}

bootstrap();
