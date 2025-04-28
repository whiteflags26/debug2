export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  limit: number;
}

export type SetPagination = Dispatch<SetStateAction<IPagination>>;
