import nodemailer, { Transporter } from 'nodemailer';
import { SETTINGS } from '../../settings/setting';

interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromName: string;
}

interface IMessage {
  email: string;
  subject: string;
  message: string;
}

export class EmailTransport {
  private transport: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(config: IEmailConfig) {
    this.transport = nodemailer.createTransport(config);
    this.fromName = config.fromName;
    this.fromEmail = config.auth.user;
  }

  async send(message: IMessage) {
    await this.transport.sendMail({
      from: `${this.fromName} <${this.fromEmail}>`,
      to: message.email,
      subject: message.subject,
      html: message.message,
    });
  }
}

export const YA_TRANSPORT = new EmailTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: SETTINGS.YA_TRANSPORT_EMAIL,
    pass: SETTINGS.YA_TRANSPORT_PASSWORD,
  },
  fromName: 'Андрей',
});
