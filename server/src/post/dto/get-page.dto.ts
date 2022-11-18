import { IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsPositive, Min } from 'class-validator';

import { ALLOWED_ITEMS_PER_PAGE } from '../post.constants';

export class GetPageDto {
  @IsIn(ALLOWED_ITEMS_PER_PAGE)
  itemsPerPage: number = 15;

  @IsNumber()
  @Min(0)
  page: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  authorId: number;
}
