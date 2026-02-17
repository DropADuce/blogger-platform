import { WithPaginationData } from '../types/pagination.types';

export const createWithPaginationResult = <T extends object>(params: {
  pageNumber: number;
  pageSize: number;
  count: number;
  items: Array<T>;
}): WithPaginationData<T> => ({
  page: params.pageNumber,
  pageSize: params.pageSize,
  pagesCount: Math.ceil(params.count / params.pageSize),
  totalCount: params.count,
  items: params.items,
});
