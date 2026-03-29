import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/index.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import compression from "compression";
import type { Request, Response } from "express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS: Use explicit origin whitelist from env, fall back to localhost for dev
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [
        "http://localhost:5173",
        "http://localhost:3001",
        "http://localhost:3002",
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Accept-Language",
    ],
    credentials: true,
  });

  // Response compression
  app.use(compression());

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Barbershop Booking API")
    .setDescription("The Barbershop Booking System API documentation")
    .setVersion("1.0")
    .addServer("http://localhost:" + (process.env.PORT || 3000))
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "access-token",
    )
    .build();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  const fullDocument = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api-docs", app, fullDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      docExpansion: "none",
    },
    customSiteTitle: "Barbershop Booking API Documentation",
  });

  // JSON endpoint
  app.getHttpAdapter().get("/api-docs/json", (req: Request, res: Response) => {
    res.json(fullDocument);
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  const url = await app.getUrl();

  if (process.env.NODE_ENV !== "production") {
    console.log(`
        Application is running on: ${url}
        API Documentation: ${url}/api-docs
        API JSON: ${url}/api-docs/json
    `);
  }
}
bootstrap();
