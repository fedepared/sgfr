export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface PaginationFooter {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationFooter;
}

export const getPaginationParams = (query: PaginationQuery, defaultLimit: number = 10) => {
  const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || defaultLimit), 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
