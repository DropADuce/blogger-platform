export interface IUser {
  accountData: IAccountData;
  emailConfirmData: IEmailConfirmationData;
  authData: IAuthData;
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

interface IAuthData {
  blackList: Array<string>;
}