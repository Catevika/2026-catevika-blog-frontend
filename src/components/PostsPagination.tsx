import Pagination from "@/components/Pagination";
import type { PostPaginationProps } from "@/types";

const PostsPagination = ({
  page,
  limit,
  totalPages,
  totalDocs,
  onPrevPage,
  onNextPage,
}: PostPaginationProps) => {
  // These are all real values, just renamed to match PexelsSidebarPagination
  const perPage = limit;
  const maxPages = totalPages;

  const data = {
    total_pages: totalPages,
    total_results: totalDocs,
  };

  return (
    <div className="my-2">
      <Pagination
        handlePrevPage={onPrevPage}
        handleNextPage={onNextPage}
        page={page}
        perPage={perPage}
        maxPages={maxPages}
        data={data}
      />
    </div>
  );
};

export default PostsPagination;
