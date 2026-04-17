import { add, isPast, parseISO } from 'date-fns';
import { inject, injectable } from 'inversify';

import { YA_TRANSPORT } from '../../../core/transport/email/email.transport';
import { UsersRepository } from '../../../repositories/users/user.repo';
import { UsersQueryRepository } from '../../../repositories/users/users.query-repo';
import { ResultStatus } from '../../../core/result/result-code';
import { createPassword } from '../../../core/lib/create-password';
import { Result } from '../../../core/result/result.types';
import { API_ERROR } from '../../../core/types/error.types';

@injectable()
export class EmailService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(UsersQueryRepository)
    private usersQueryRepository: UsersQueryRepository
  ) {}

  private sendEmail(data: { email: string; subject: string; message: string }) {
    YA_TRANSPORT.send(data);
  }

  private getConfirmMessage(code: string) {
    return `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
 </p>`;
  }

  private getRecoveryMessage(code: string) {
    return `
    <h1>Password recovery</h1>
    
    <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
    </p>
    `;
  }

  private get confirmCode() {
    return crypto.randomUUID().toString();
  }

  private get expDate() {
    return add(new Date(), { days: 3 }).toISOString();
  }

  sendConfirmCode(data: { code: string; email: string }) {
    this.sendEmail({
      email: data.email,
      subject: 'Подтверждение регистрации',
      message: this.getConfirmMessage(data.code),
    });
  }

  async resendConfirmCode(data: { userId: string; email: string }) {
    const code = crypto.randomUUID();

    await this.usersRepository.updateConfirmCode(data.userId, {
      code,
      expDate: this.expDate,
    });

    this.sendConfirmCode({ code, email: data.email });
  }

  async sendRecoveryCode(data: { userId: string; email: string }) {
    const code = this.confirmCode;

    await this.usersRepository.updateConfirmCode(data.userId, {
      code,
      expDate: this.expDate,
    });

    this.sendEmail({
      email: data.email,
      subject: 'Восстановлене пароля',
      message: this.getRecoveryMessage(code),
    });

    // К сожалению приходится так, иначе ловим блок от yandex
    await new Promise((r) => setTimeout(r, 500));
  }

  async updatePasswordByRecoveryCode(dto: {
    newPassword: string;
    recoveryCode: string;
  }): Promise<Result<API_ERROR | null>> {
    const user = await this.usersQueryRepository.findByConfirmCode(
      dto.recoveryCode
    );

    const isValid = !!user && !isPast(parseISO(user.emailConfirmData.exp_date));

    const password = await createPassword({ password: dto.newPassword });

    if (isValid)
      await this.usersRepository.updateUserPassword(user.id, password);

    return {
      status: isValid ? ResultStatus.NoContent : ResultStatus.BadRequest,
      data: isValid
        ? null
        : {
            errorsMessages: [
              { field: 'recoveryCode', message: 'Не валидный код' },
            ],
          },
      extensions: [],
    };
  }

  async verifyCode(code: string) {
    const user = await this.usersQueryRepository.findByConfirmCode(code);

    const isValid = !!user && !isPast(parseISO(user.emailConfirmData.exp_date));

    if (isValid) await this.usersRepository.confirmCode(user.id.toString());

    return {
      status: isValid ? ResultStatus.NoContent : ResultStatus.BadRequest,
      data: null,
      errorMessage: '',
      extensions: [],
    };
  }
}
