import { Module } from '@nestjs/common';
import { EmailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import * as process from 'process';
import { RmqModule } from '@app/common';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: 'ec6db1964-3b26fe+1@inbox.mailtrap.io',
      },
    }),
    RmqModule.registerAsync({ name: 'mail' }),
  ],
  controllers: [EmailController],
  providers: [MailService],
})
export class MailModule {}
