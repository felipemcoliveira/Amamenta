import { Expose, Type } from 'class-transformer';

import Post from '../models/post.model';

@Expose()
export class PageDto {
  itemsPerPage: number;

  pageCount: number;

  page: number;

  @Type(() => Post)
  posts: Array<Post>;
}
