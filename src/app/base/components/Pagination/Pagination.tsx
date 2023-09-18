/* eslint-disable react/no-multi-comp */
import type { HTMLProps } from "react";

import type { PropsWithSpread } from "@canonical/react-components";
import classNames from "classnames";

import PaginationButton from "./PaginationButton";
import PaginationItem from "./PaginationItem";

const scrollTop = () => window.scrollTo(0, 0);

const generatePaginationItems = (
  pageNumbers: number[],
  currentPage: number,
  truncateThreshold: number,
  changePage: (page: number) => void
) => {
  const lastPage = pageNumbers.length;
  const truncated = lastPage > truncateThreshold;

  let visiblePages;
  if (truncated) {
    // the default range for pages outside the start and end threshold
    let start = currentPage - 2;
    let end = currentPage + 1;
    // on page 1, also show pages 2, 3 and 4
    if (currentPage === 1) {
      start = 1;
      end = currentPage + 3;
    }
    // on page 2, show page 1, and also pages 3, and 4
    if (currentPage === 2) {
      start = 1;
      end = currentPage + 2;
    }
    // on the last page and page before last, also show the 3 previous pages
    if (currentPage === lastPage || currentPage === lastPage - 1) {
      start = lastPage - 4;
      end = lastPage - 1;
    }
    visiblePages = pageNumbers.slice(start, end);
  } else {
    visiblePages = pageNumbers;
  }

  const items = [];
  if (truncated) {
    // render first in sequence
    items.push(
      <PaginationItem
        isActive={currentPage === 1}
        key={1}
        number={1}
        onClick={() => changePage(1)}
      />
    );
    if (![1, 2, 3].includes(currentPage)) {
      items.push(<PaginationItemSeparator key="sep1" />);
    }
  }

  items.push(
    visiblePages.map((number) => (
      <PaginationItem
        isActive={number === currentPage}
        key={number}
        number={number}
        onClick={() => changePage(number)}
      />
    ))
  );

  if (truncated) {
    // render last in sequence
    if (![lastPage, lastPage - 1, lastPage - 2].includes(currentPage)) {
      items.push(<PaginationItemSeparator key="sep2" />);
    }
    items.push(
      <PaginationItem
        isActive={currentPage === lastPage}
        key={lastPage}
        number={lastPage}
        onClick={() => changePage(lastPage)}
      />
    );
  }
  return items;
};

const PaginationItemSeparator = (): JSX.Element => (
  <li className="p-pagination__item p-pagination__item--truncation">
    &hellip;
  </li>
);

export type Props = PropsWithSpread<
  {
    /**
     * The current page being viewed.
     */
    currentPage: number;
    /**
     * The number of items to show per page.
     */
    itemsPerPage: number;
    /**
     * The total number of pages.
     */
    totalPages?: number;
    /**
     * Function to handle paginating the items.
     */
    paginate: (page: number) => void;
    /**
     * The total number of items.
     */
    totalItems: number;
    /**
     * Whether to scroll to the top of the list on page change.
     */
    scrollToTop?: boolean;
    /**
     * The number of pages at which to truncate the pagination items.
     */
    truncateThreshold?: number;
    /**
     * Whether or not the pagination is ceneterd on the page.
     */
    centered?: boolean;
  },
  HTMLProps<HTMLElement>
>;

const Pagination = ({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
  scrollToTop,
  truncateThreshold = 10,
  centered,
  totalPages,
  ...navProps
}: Props): JSX.Element | null => {
  // return early if no pagination is required
  if (totalItems <= itemsPerPage) {
    return null;
  }

  const pageNumbers = [];

  if (totalPages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
  }

  const changePage = (page: number) => {
    paginate(page);
    scrollToTop && scrollTop();
  };

  return (
    <nav aria-label="Pagination" className="p-pagination" {...navProps}>
      <ol
        className={classNames("p-pagination__items", {
          "u-align--center": centered,
        })}
      >
        <PaginationButton
          direction="back"
          disabled={currentPage === 1}
          key="back"
          onClick={() => changePage(currentPage - 1)}
        />

        {generatePaginationItems(
          pageNumbers,
          currentPage,
          truncateThreshold,
          changePage
        )}

        <PaginationButton
          direction="forward"
          disabled={currentPage === pageNumbers.length}
          key="forward"
          onClick={() => changePage(currentPage + 1)}
        />
      </ol>
    </nav>
  );
};

export default Pagination;