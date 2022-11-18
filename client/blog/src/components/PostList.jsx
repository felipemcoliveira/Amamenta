import { useResource } from '@amamentaufn/client-core';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, Fragment } from 'react';
import { Pagination } from './Pagination';
import { Post, PostPlaceholder } from './Post';

// ------------------------------------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------------------------------------

import './PostList.scss';

// ------------------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------------------

const SEARCH_PARAM_PAGE = 'pagina';
const SEARCH_PARAM_CATEGORY = 'categoria';

// ------------------------------------------------------------------------------------------------------------
// PostList Component
// ------------------------------------------------------------------------------------------------------------

export function PostList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterCategoryId = getSearchParam(searchParams, SEARCH_PARAM_CATEGORY, undefined, parseInt);
  const pageNum = getSearchParam(searchParams, SEARCH_PARAM_PAGE, 1, parseInt);

  const [categories, isCategoriesLoading] = useResource(
    {
      method: 'GET',
      url: '/category'
    },
    []
  );

  const [page, isLoading, error] = useResource(
    {
      method: 'GET',
      url: '/post',
      params: {
        page: Math.max(pageNum - 1, 0),
        itemsPerPage: 10,
        categoryId: filterCategoryId
      }
    },
    [filterCategoryId, pageNum]
  );

  useEffect(() => {
    console.log(pageNum);
    if (page && (pageNum < 1 || pageNum > page.pageCount)) {
      var clampedPage = Math.min(page.pageCount, Math.max(1, pageNum));
      if (clampedPage === 0) {
        searchParams.delete(SEARCH_PARAM_PAGE);
      } else {
        searchParams.set(SEARCH_PARAM_PAGE, clampedPage);
      }
      setSearchParams(searchParams);
    }
  }, [page, pageNum, searchParams]);

  const handlePageChange = useCallback(
    newPage => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        searchParams.set(SEARCH_PARAM_PAGE, newPage);
        setSearchParams(searchParams);
      }, 150);
    },
    [searchParams]
  );

  const handleSelectCategory = useCallback(
    evt => {
      const categoryId = parseInt(evt.target.getAttribute('data-categoryid'));
      searchParams.delete(SEARCH_PARAM_PAGE);
      searchParams.set(SEARCH_PARAM_CATEGORY, categoryId);
      setSearchParams(searchParams);
    },
    [categories, searchParams]
  );

  const handleClearCategoryFilter = useCallback(() => {
    searchParams.delete(SEARCH_PARAM_PAGE);
    searchParams.delete(SEARCH_PARAM_CATEGORY);
    setSearchParams(searchParams);
  }, [searchParams]);

  const selectedCategory = filterCategoryId && categories && categories.find(c => c.id === filterCategoryId);

  const postPlaceholders = [];

  let content;

  if (isLoading) {
    for (let i = 0; i < 10; i++) {
      postPlaceholders.push(<PostPlaceholder />);
    }
    content = postPlaceholders;
  } else if (error) {
    content = <div className='post-list__error'>Houve um erro. Não foi possível carregar nenhuma publicação.</div>;
  } else if (page.posts.length === 0) {
    content = <div className='post-list__error'>Nenhuma publicação encontrada.</div>;
  } else {
    content = (
      <Fragment>
        {page.posts.map(post => {
          return (
            <div className='post-list__element' key={post.id}>
              <Post post={post} key={post.id} gotoPost />
            </div>
          );
        })}

        <Pagination page={pageNum || 1} onPageChange={handlePageChange} pages={page && page.pageCount} />
      </Fragment>
    );
  }

  return (
    <div id='posts' className='post-list'>
      <CategoryFilter
        categories={categories}
        handleClearCategoryFilter={handleClearCategoryFilter}
        handleSelectCategory={handleSelectCategory}
        loading={isCategoriesLoading}
        selectedCategory={selectedCategory}
      />
      {content}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------
// CategoryFilter Component
// ------------------------------------------------------------------------------------------------------------

const categoryPlaceholderNameLengthes = [11, 15, 8, 12, 14];

function CategoryFilter({ categories, loading, selectedCategory, handleClearCategoryFilter, handleSelectCategory }) {
  if (categories === undefined || categories.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className='post-list__filter post-list__filter--placeholder'>
        <span className='post-list__filter-title'>Filtre as publicações por categoria:</span>
        <div className='post-list__categories'>
          {categoryPlaceholderNameLengthes.map((len, index) => {
            const name = 'placeholder name'.substring(0, len);
            return (
              <div className='post-list__category cpe' key={name + index}>
                {name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className='post-list__filter'>
        <span className='post-list__filter-title'>Você esta vendo as publicações da categoria:</span>
        <div className='post-list__categories'>
          <div className='post-list__category' style={{ backgroundColor: selectedCategory.color }}>
            {selectedCategory.name}
          </div>
        </div>
        <div className='post-list__clear-filter-btn' onClick={handleClearCategoryFilter}>
          🠄 Ver todas as publicações
        </div>
      </div>
    );
  }

  return (
    <div className='post-list__filter'>
      <span className='post-list__filter-title'>Filtre as publicações por categoria:</span>
      <div className='post-list__categories'>
        {categories.map(category => {
          return (
            <div
              className='post-list__category'
              key={category.id}
              style={{ backgroundColor: category.color }}
              data-categoryid={category.id}
              onClick={handleSelectCategory}>
              {category.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------------------------------------

function getSearchParam(searchParams, paramName, defaultValue, parseFn) {
  const searchParam = searchParams.get(paramName);
  const deserializedSearchParam = (parseFn && parseFn(searchParam)) ?? searchParam;
  if (isNaN(deserializedSearchParam)) {
    return defaultValue;
  }

  return deserializedSearchParam ?? defaultValue;
}
