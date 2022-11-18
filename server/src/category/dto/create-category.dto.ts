import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

const COLOR_HEX_REGEX = /^\#(?:[0-9a-fA-F]{3,4}){1,2}$/;

export class CreateCategoryDto {
  @MinLength(3, { message: 'Nome curto demais.' })
  @MaxLength(32, { message: 'Nome comprido demais.' })
  name: string;

  @MaxLength(255, { message: 'Utilize uma descrição menor.' })
  @IsOptional()
  description: string;

  @Matches(COLOR_HEX_REGEX, { message: 'Formato da cor inválida.' })
  color: string;
}
