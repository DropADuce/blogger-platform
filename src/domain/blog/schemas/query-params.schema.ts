import { z } from 'zod';
import { WithSortAndPaginationSchema } from '../../../core/schemas/query-params.schema';

const SEARCH_NAME_TERM_FALLBACK = '';

const FilterByFieldSchema = z.object({
  searchNameTerm: z.string().optional().default(SEARCH_NAME_TERM_FALLBACK),
});

export const WithFilterAndSortAndPaginationSchema =
  WithSortAndPaginationSchema.and(FilterByFieldSchema);

export type WithFilterAndSortAndPagination = z.input<
  typeof WithFilterAndSortAndPaginationSchema
>;