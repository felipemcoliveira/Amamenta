import { Fragment, useCallback } from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { IoEllipsisHorizontal } from 'react-icons/io5';
import cn from 'classnames';

// ------------------------------------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------------------------------------

import './Pagination.scss';

// ------------------------------------------------------------------------------------------------------------
// Pagination Component
// ------------------------------------------------------------------------------------------------------------

export function Pagination({ page, onPageChange, pages }) {
  const gotoPrev = useCallback(() => {
    const prevPage = Math.max(1, page - 1);
    if (prevPage !== page) {
      onPageChange && onPageChange(prevPage);
    }
  }, [onPageChange, page]);

  const gotoNext = useCallback(() => {
    const nextPage = Math.min(pages, page + 1);
    if (nextPage !== page) {
      onPageChange && onPageChange(nextPage);
    }
  }, [onPageChange, pages, page]);

  const handlePageChange = useCallback(
    evt => {
      evt.preventDefault();
      const page = evt.target.getAttribute('data-page');
      onPageChange && onPageChange(parseInt(page));
    },
    [onPageChange]
  );

  if (pages < 1) {
    return null;
  }

  const sideItemCount = 2;
  let begin = page - sideItemCount;
  let end = page + sideItemCount;
  if (begin < 1) {
    end = Math.min(pages, end - begin + 1);
    begin = 1;
  }
  if (end >= pages) {
    begin = Math.max(1, begin - (end - pages));
    end = pages;
  }

  const elements = [];
  for (let i = begin; i <= end; i++) {
    elements.push(
      <div
        key={i}
        className={cn('pagination__item', {
          'pagination__item--selected': page === i
        })}
        data-page={i}
        onClick={handlePageChange}>
        {i}
      </div>
    );
  }

  return (
    <div className='pagination'>
      <div key='prev' className='pagination__item' data-page='1' title='Página Anterior' onClick={gotoPrev}>
        <MdKeyboardArrowLeft />
      </div>

      {elements}

      <div key='next' className='pagination__item' data-page={pages} title='Próxima Página' onClick={gotoNext}>
        <MdKeyboardArrowRight />
      </div>
    </div>
  );
}
