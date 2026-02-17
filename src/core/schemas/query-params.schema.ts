import { z } from 'zod';

const SEARCH_NAME_TERM_FALLBACK = '';
const SORT_FIELD_FALLBACK = 'createdAt';
const SORT_DIRECTIVES_FALLBACK = 'desc';
const PAGE_NUMBER_FALLBACK = '1';
const PORTION_SIZE_FALLBACK = '10';

const FilterByFieldSchema = z.object({
  searchNameTerm: z.string().optional().default(SEARCH_NAME_TERM_FALLBACK),
});

const SortByFieldSchema = z.object({
  sortBy: z.string().optional().default(SORT_FIELD_FALLBACK),
  sortDirection: z
    .enum(['asc', 'desc'])
    .optional()
    .default(SORT_DIRECTIVES_FALLBACK),
});

const PaginationSchema = z
  .object({
    pageNumber: z.string().optional().default(PAGE_NUMBER_FALLBACK),
    pageSize: z.string().optional().default(PORTION_SIZE_FALLBACK),
  })
  .transform((prev) => ({
    pageNumber: Number(prev.pageNumber),
    pageSize: Number(prev.pageSize),
  }))
  .pipe(
    z.object({
      pageSize: z.number().refine((v) => !Number.isNaN(v)),
      pageNumber: z.number().refine((v) => !Number.isNaN(v)),
    })
  );

export const WithSortAndPaginationSchema =
  SortByFieldSchema.and(PaginationSchema);

export const WithFilterAndSortAndPaginationSchema =
  WithSortAndPaginationSchema.and(FilterByFieldSchema);

export type WithSortAndPagination = z.infer<typeof WithSortAndPaginationSchema>;
export type WithFilterAndSortAndPagination = z.infer<
  typeof WithFilterAndSortAndPaginationSchema
>;
