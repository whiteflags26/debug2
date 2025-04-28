import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/Button";
import { IPagination, SetPagination } from "@/types/pagination";

interface Props {
  pagination: IPagination;
  setPagination: SetPagination;
}

export default function TurfPagination({ pagination, setPagination }: Props) {
  const { currentPage, totalPages } = pagination;
  const maxPagesToShow = 5;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() =>
          setPagination((prev: { currentPage: number; }) => ({
            ...prev,
            currentPage: prev.currentPage - 1,
          }))
        }
        className="flex items-center gap-1"
      >
        <ChevronLeft size={16} /> Previous
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page) => (
            <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setPagination((prev: IPagination) => ({ ...prev, currentPage: page }))
            }
            >
            {page}
            </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() =>
          setPagination((prev: IPagination) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
          }))
        }
        className="flex items-center gap-1"
      >
        Next <ChevronRight size={16} />
      </Button>
    </div>
  );
}
