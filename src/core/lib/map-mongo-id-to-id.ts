import { WithId } from 'mongodb';

export const mapMongoIdToId = <ITEM extends object>({
  _id,
  ...item
}: WithId<ITEM>): Omit<WithId<ITEM>, '_id'> & { id: string } => ({
  ...item,
  id: String(_id),
});
