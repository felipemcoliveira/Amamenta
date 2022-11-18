import { Transform } from 'class-transformer';
import { MinLength, IsNotEmpty } from 'class-validator';
import * as sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'a']),
  allowedAttributes: {
    '*': ['style', 'class'],
    allowedIframeHostnames: ['www.youtube.com'],
    a: sanitizeHtml.defaults.allowedAttributes.a.concat(['href', 'name', 'target']),
    img: sanitizeHtml.defaults.allowedAttributes.img.concat(['attachment-instanceid'])
  }
};

export class CreatePostDto {
  @MinLength(4, { message: 'Título muito curto.' })
  title: string;

  @IsNotEmpty()
  @Transform(({ value }) => sanitizeHtml(value, SANITIZE_OPTIONS))
  content: string;

  @IsNotEmpty()
  categoryId: number;
}
