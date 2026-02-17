import { Filter, Sort } from 'mongodb';
import {
  WithFilterAndSortAndPagination,
  WithSortAndPagination,
} from '../schemas/query-params.schema';

interface IQueryResult {
  sortParams: Sort;
  pagination: { skip: number; count: number };
}

interface IQueryResultWithFilter<T> extends IQueryResult {
  filter: Filter<T>;
}

const isHaveFilter = (
  parms: WithSortAndPagination | WithFilterAndSortAndPagination
): parms is WithFilterAndSortAndPagination => 'searchNameTerm' in parms;

export function buildQuery(params: WithSortAndPagination): IQueryResult;
export function buildQuery<T extends object>(
  params: WithFilterAndSortAndPagination,
  searchField: keyof T
): IQueryResultWithFilter<T>;

export function buildQuery<T extends object>(
  params: WithSortAndPagination | WithFilterAndSortAndPagination,
  searchField?: keyof T
): IQueryResult | IQueryResultWithFilter<T> {
  const sortParams: Sort = {
    [params.sortBy]: params.sortDirection === 'asc' ? 1 : -1,
  };

  const skip = (params.pageNumber - 1) * params.pageSize;

  return {
    sortParams,
    pagination: { skip, count: params.pageSize },
    ...(isHaveFilter(params) && !!searchField && {
      filter: {
        [searchField]: { $regex: params.searchNameTerm, $options: 'i' },
      },
    }),
  };
}
