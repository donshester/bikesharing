import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller()
export class EmailController {
  constructor(
    private readonly mailService: MailService,
    private readonly rmqService: RmqService,
  ) {}
  @EventPattern('send_email')
  async sendActivationEmail(
    @Payload() data: { email: string; activationToken: string },
    @Ctx() ctx: RmqContext,
  ) {
    console.log('sender');
    await this.mailService.SendActivationEmail(
      data.email,
      data.activationToken,
    );
    this.rmqService.ack(ctx);
    return {
      success: true,
      message: 'Activation email sent successfully',
    };
  }
}
