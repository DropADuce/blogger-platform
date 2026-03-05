import { Filter, Sort } from 'mongodb';

export interface IQueryParams<T> {
  sortParams: Sort;
  pagination: { skip: number; count: number };
  filter: Filter<T>;
}