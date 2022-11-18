import { useResource } from '@amamentaufn/client-core';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Post, PostPlaceholder } from '../components/Post';

export default function HomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, isLoading, error] = useResource({ method: 'GET', url: `/post/${id}` });

  useEffect(() => {
    if (post?.title) {
      navigate(`./${encodeURIComponent(post.title.replaceAll(' ', '-'))}`, { replace: true });
    }
  }, [post?.id, post?.title]);

  if (isLoading) {
    return <PostPlaceholder />;
  }

  return <Post post={post} gotoCategory />;
}
