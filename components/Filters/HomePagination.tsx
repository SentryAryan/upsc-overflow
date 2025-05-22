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
  console.log(searchParams.get("page"));

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Page */}
        <PaginationItem>
          <PaginationPrevious
            href={`${pathname}?page=${
              currentPage === 1 ? totalPages : currentPage - 1
            }${subject ? `&subject=${subject}` : ""}${
              tag ? `&tag=${tag}` : ""
            }${question ? `&question=${question}` : ""}`}
          />
        </PaginationItem>

        {/* Pages */}
        {totalPages <= 10 ? (
          <>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`${pathname}?page=${i + 1}${
                    subject ? `&subject=${subject}` : ""
                  }${tag ? `&tag=${tag}` : ""}${
                    question ? `&question=${question}` : ""
                  }`}
                  isActive={currentPage === i + 1}
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
                  }`}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {/* Next Page */}
        <PaginationItem>
          <PaginationNext
            href={`${pathname}?page=${
              currentPage === totalPages ? 1 : currentPage + 1
            }${subject ? `&subject=${subject}` : ""}${
              tag ? `&tag=${tag}` : ""
            }${question ? `&question=${question}` : ""}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default HomePagination;
