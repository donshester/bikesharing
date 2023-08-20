import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqService } from '@app/common/rmq/rmq.service';

export interface RmqModuleAsyncOptions {
  name: string;
}
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {
  static registerAsync(options: RmqModuleAsyncOptions): DynamicModule {
    return {
      module: RmqModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: options.name,
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RABBIT_MQ_URI')],
                queue: configService.get<string>(
                  `RABBIT_MQ_${options.name}_QUEUE`,
                ),
                queueOptions: {
                  durable: true,
                },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
