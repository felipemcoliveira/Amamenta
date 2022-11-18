import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @Transform((args) => {
    try {
      return JSON.parse(args.obj['referencedAttachments']);
    } catch (error) {
      return undefined;
    }
  })
  @IsArray()
  @Type(() => Number)
  referencedAttachments: Array<number>;
}
