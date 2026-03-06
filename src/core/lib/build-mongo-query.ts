import { WithSortAndPagination } from '../schemas/query-params.schema';
import { Filter, Sort } from 'mongodb';
import { IQueryParams } from '../types/query-params.types';

export const buildFilter = <T extends object>(
  entries: Array<[keyof T, string | undefined]>,
  mode: 'or' | 'and' = 'and'
): Filter<T> => {
  const filters: Array<Filter<T>> = [];

  entries.forEach(([field, value]) => {
    if (value)
      filters.push({
        [field]: { $regex: value, $options: 'i' },
      } as Filter<T>);
  });

  if (!filters.length) return {};

  if (mode === 'or') return { $or: filters } as Filter<T>;

  return Object.assign({}, ...filters);
};

export const buildQuery = <T extends object>(
  params: WithSortAndPagination,
  filter: Filter<T> = {}
): IQueryParams<T> => {
  const sortParams: Sort = {
    [params.sortBy]: params.sortDirection === 'asc' ? 1 : -1,
  };

  const skip = (params.pageNumber - 1) * params.pageSize;

  return {
    sortParams,
    pagination: { skip, count: params.pageSize },
    filter,
  };
};
