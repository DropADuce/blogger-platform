import bcrypt from 'bcrypt';

interface IConfig {
  password: string;
  saltLevel?: number;
}

export const createPassword = async ({ password, saltLevel = 10 }: IConfig) => {
  const salt = await bcrypt.genSalt(saltLevel);

  return await bcrypt.hash(password, salt);
};
