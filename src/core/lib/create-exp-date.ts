import { add } from 'date-fns';

export const createExpDate = () => add(new Date(), { days: 3 }).toISOString();
