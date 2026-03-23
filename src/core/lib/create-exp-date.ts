import { add } from 'date-fns';

export const createExpDate = () => add(new Date(), { minutes: 3 }).toISOString();