import { PaginationMeta } from '@/interfaces/pagination.interface';

const DEFAULT_PAGE = 1;
const DEFAULT_ITEM_PER_PAGE = 20;
const MAX_ITEM_PER_PAGE = 100;

export function parsePaginationParams(
  pageRaw: unknown,
  itemPerPageRaw: unknown,
): { page: number; itemPerPage: number; skip: number; take: number } {
  const page = Math.max(DEFAULT_PAGE, parseInt(String(pageRaw), 10) || DEFAULT_PAGE);
  const itemPerPage = Math.min(MAX_ITEM_PER_PAGE, Math.max(1, parseInt(String(itemPerPageRaw), 10) || DEFAULT_ITEM_PER_PAGE));
  const skip = (page - 1) * itemPerPage;

  return { page, itemPerPage, skip, take: itemPerPage };
}

export function buildPaginationMeta(page: number, itemPerPage: number, total: number): PaginationMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / itemPerPage);

  return {
    page,
    itemPerPage,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
