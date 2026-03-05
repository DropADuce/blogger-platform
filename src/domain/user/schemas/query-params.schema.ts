import { z } from 'zod';
import { WithSortAndPaginationSchema } from '../../../core/schemas/query-params.schema';

const SEARCH_TERM_FALLBACK = '';

const FilterByFieldSchema = z.object({
  searchLoginTerm: z.string().optional().default(SEARCH_TERM_FALLBACK),
  searchEmailTerm: z.string().optional().default(SEARCH_TERM_FALLBACK),
});

export const WithFilterAndSortAndPaginationSchema =
  WithSortAndPaginationSchema.and(FilterByFieldSchema);

export type WithFilterAndSortAndPagination = z.input<
  typeof WithFilterAndSortAndPaginationSchema
>;