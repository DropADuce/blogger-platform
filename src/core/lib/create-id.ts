import { ObjectId } from 'mongodb';

export const createId = (id: string): ObjectId => new ObjectId(id)
