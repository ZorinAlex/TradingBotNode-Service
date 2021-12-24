import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Logger} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: true});
  await app.listen(Number(process.env.PORT) || 3000);
  const logger = new Logger('NEST APP');
  logger.log(`Nest app started at port: ${process.env.PORT}`);
}
bootstrap();
