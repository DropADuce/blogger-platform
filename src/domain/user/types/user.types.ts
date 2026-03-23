export interface IUser {
  accountData: IAccountData;
  emailConfirmData: IEmailConfirmationData
}

interface IAccountData {
  login: string;
  email: string;
  password: string;
  createdAt: string;
}

interface IEmailConfirmationData {
  code: string;
  exp_date: string;
  isConfirmed: boolean;
}