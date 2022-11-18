import { deserializePostContent } from '@amamentaufn/client-core';
import React, { useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

// ------------------------------------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------------------------------------

import './Post.scss';

// ------------------------------------------------------------------------------------------------------------
// TimeAgo
// ------------------------------------------------------------------------------------------------------------

import TimeAgo from 'javascript-time-ago';
import pt from 'javascript-time-ago/locale/pt';
TimeAgo.addDefaultLocale(pt);
const timeAgoFormatter = new TimeAgo('pt');

// ------------------------------------------------------------------------------------------------------------
// Post Component
// ------------------------------------------------------------------------------------------------------------

export function Post({ post, gotoCategory, gotoPost }) {
  const navigate = useNavigate();
  const { deserializedContent, timeAgo, date } = useMemo(() => {
    const deserializedContent = deserializePostContent(post);
    const date = new Date(post.createdAt);
    const timeAgo = timeAgoFormatter.format(date);

    return { timeAgo, deserializedContent, date };
  }, [post]);

  const gotoCategoryPosts = useCallback(() => {
    navigate(`/?categoria=${post.category.id}`);
  }, []);

  return (
    <div className='post'>
      <div className='post__header'>
        <div className='post__time' title={date.toLocaleString()}>
          {timeAgo}
        </div>
        {gotoPost ? (
          <Link className='post__title' to={`/publicacao/${post.id}`}>
            {post.title}
          </Link>
        ) : (
          <div className='post__title'>{post.title}</div>
        )}

        <div className='post__details'>
          <span
            className='post__item post__item--category'
            style={{ backgroundColor: post.category.color, cursor: gotoCategory ? 'pointer' : 'initial' }}
            onClick={gotoCategory ? gotoCategoryPosts : null}
            title='Veja mais publicações nessa categoria.'>
            {post.category.name}
          </span>
          <span className='post__item post__item--author'>{`${post.author.firstName} ${post.author.lastName}`}</span>
        </div>
      </div>
      <div className='post__content fr-view' dangerouslySetInnerHTML={{ __html: deserializedContent }} />
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------
// Post Placeholder
// ------------------------------------------------------------------------------------------------------------

export const PostPlaceholder = React.memo(function () {
  return (
    <div className='post post--placeholder'>
      <div className='post__header'>
        <div className='post__time cpe'>&nbsp;</div>
        <div className='post__title cpe'>&nbsp;</div>
        <div className='post__details cpe'>&nbsp;</div>
      </div>
      <div className='post__content fr-view' data-css-revert='false'>
        <span style={{ width: '25%' }} className='cpe'>
          &nbsp;
        </span>
        <span className='cpe'>&nbsp;</span>
        <span className='cpe'>&nbsp;</span>
        <span>&nbsp;</span>
        <span style={{ width: '45%' }} className='cpe'>
          &nbsp;
        </span>
        <span className='cpe'>&nbsp;</span>
        <span className='pce'>&nbsp;</span>
        <span>&nbsp;</span>
        <span style={{ width: '30%' }} className='cpe'>
          &nbsp;
        </span>
        <span className='cpe'>&nbsp;</span>
        <span className='cpe'>&nbsp;</span>
      </div>
    </div>
  );
});
