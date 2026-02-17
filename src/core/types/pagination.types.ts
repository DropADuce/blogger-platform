interface IPaginationData {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
}

export type WithPaginationData<T extends object> = IPaginationData & {
  items: Array<T>;
};
