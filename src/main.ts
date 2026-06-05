import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule,{
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: require.resolve('ulms-contracts/protos/user.proto'),
      url: '0.0.0.0:50052'
    }
  })
  await app.listen();
}
bootstrap();