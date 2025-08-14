import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useSearchParams } from "next/navigation";

const HomePagination = ({
  totalPages,
  subject,
  tag,
  question,
}: {
  totalPages: number;
  subject?: string;
  tag?: string;
  question?: string;
}) => {
  console.log("HomePagination.jsx");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy");
  const baseRouteToPush = `${pathname}?${searchParams.toString()}`;
  console.log(searchParams.get("page"));

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Page */}
        <PaginationItem>
          <PaginationPrevious
            href={totalPages === 0 ? "" : `${pathname}?page=${
              currentPage === 1 ? totalPages : currentPage - 1
            }${subject ? `&subject=${subject}` : ""}${
              tag ? `&tag=${tag}` : ""
            }${question ? `&question=${question}` : ""}${
              sortBy ? `&sortBy=${sortBy}` : ""
            }`}
            className="animate-slide-up"
          />
        </PaginationItem>

        {/* Pages */}
        {totalPages === 0 ? (
          <PaginationItem>
            <PaginationEllipsis className="animate-slide-up" />
          </PaginationItem>
        ) : totalPages <= 10 ? (
          <>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`${pathname}?page=${i + 1}${
                    subject ? `&subject=${subject}` : ""
                  }${tag ? `&tag=${tag}` : ""}${
                    question ? `&question=${question}` : ""
                  }${sortBy ? `&sortBy=${sortBy}` : ""}`}
                  isActive={currentPage === i + 1}
                  className="animate-slide-up"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </>
        ) : (
          <>
            {Array.from({ length: 10 }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`${pathname}?page=${i + 1}${
                    subject ? `&subject=${subject}` : ""
                  }${tag ? `&tag=${tag}` : ""}${
                    question ? `&question=${question}` : ""
                  }${sortBy ? `&sortBy=${sortBy}` : ""}`}
                  isActive={currentPage === i + 1}
                  className="animate-slide-up"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis className="animate-slide-up" />
            </PaginationItem>
          </>
        )}

        {/* Next Page */}
        <PaginationItem>
          <PaginationNext
            href={totalPages === 0 ? "" : `${pathname}?page=${
              currentPage === totalPages ? 1 : currentPage + 1
            }${subject ? `&subject=${subject}` : ""}${
              tag ? `&tag=${tag}` : ""
            }${question ? `&question=${question}` : ""}${
              sortBy ? `&sortBy=${sortBy}` : ""
            }`}
            className="animate-slide-up"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default HomePagination;
