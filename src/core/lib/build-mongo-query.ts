import { WithSortAndPagination } from '../schemas/query-params.schema';
import { Filter, Sort } from 'mongodb';
import { IQueryParams } from '../types/query-params.types';

export const buildFilter = <T extends object>(entries: Array<[keyof T, string | undefined]>): Filter<T> => {
  const filters: Filter<T> = {};

  entries.forEach(([field, value]) => {
    if (value) {
      filters[field as keyof Filter<T>] = { $regex: value, $options: 'i' };
    }
  });

  return filters;
};

export const buildQuery = <T extends object>(
  params: WithSortAndPagination,
  filter: Filter<T> = {},
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
