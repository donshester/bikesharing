import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async SendActivationEmail(
    email: string,
    activationToken: string,
  ): Promise<void> {
    const activationLink = `${process.env.URL}/activate?token=${activationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Activate Your Account',
      html: `<p>Please click the following link to activate your account: <a href="${activationLink}">${activationLink}</a></p>`,
    });
  }
}
