import { YA_TRANSPORT } from '../../../core/transport/email/email.transport';
import { usersQueryRepo } from '../../../repositories/users/users.query-repo';
import { Result } from '../../../core/result/result.types';
import { ResultStatus } from '../../../core/result/result-code';
import { isPast, parseISO } from 'date-fns';
import { usersRepo } from '../../../repositories/users/user.repo';
import { createExpDate } from '../../../core/lib/create-exp-date';

const sendCode = (confirmationData: { code: string; email: string }) => {
  YA_TRANSPORT.send({
    email: confirmationData.email,
    subject: 'Подтверждение регистрации',
    message: `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href='https://somesite.com/confirm-email?code=${confirmationData.code}'>complete registration</a>
 </p>`,
  });
};

const resendCode = async (userId: string, email: string) => {
  const code = crypto.randomUUID();

  await usersRepo.updateCode(userId, { code, expDate: createExpDate() });

  return sendCode({ code, email });
};

const verifyCode = async (code: string): Promise<Result> => {
  const user = await usersQueryRepo.findByConfirmCode(code);

  const isValid = !!user && !isPast(parseISO(user.emailConfirmData.exp_date));

  if (isValid) await usersRepo.confirm(user.id.toString());

  return {
    status: isValid ? ResultStatus.NoContent : ResultStatus.BadRequest,
    data: null,
    errorMessage: '',
    extensions: isValid ? [] : [{ field: 'code', message: 'Не валидный код' }],
  };
};

export const emailService = {
  sendCode,
  verifyCode,
  resendCode,
};
