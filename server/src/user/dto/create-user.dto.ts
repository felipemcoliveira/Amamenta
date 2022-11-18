import * as bcrpty from 'bcrypt';

import { Expose, Transform, Type } from 'class-transformer';
import { IsEmail, Matches, Length, IsOptional } from 'class-validator';

// https://regexlib.com/REDetails.aspx?regexp_id=1111
const PASSWORD_REGEX = /^(?=^.{8,32}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/;

const NAME_REGEX = /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/;

export const Trim = () => Transform(({ value }) => value?.trim());

export class CreateUserDto {
  @Trim()
  @Matches(NAME_REGEX, { message: 'Nome contem um ou mais caractério não permitido.' })
  @Length(3, 32, { message: 'Nome deve ter de 3 a 32 caractérios.' })
  firstName: string;

  @Trim()
  @Matches(NAME_REGEX, { message: 'Sobrenome contem um ou mais caractérios não permitidos.' })
  @Length(3, 32, { message: 'Sobrenome deve ter de 3 a 32 caractérios.' })
  lastName: string;

  @IsEmail({}, { message: 'Email inválido.' })
  email: string;

  @Matches(PASSWORD_REGEX, {
    message:
      'A senha deve ter de 8 a 32 caractérios e contar pelo menos ' +
      'uma letrá maiúscula, outra minúscula, um número e um símbolo.'
  })
  password: string;

  @Expose()
  @IsOptional()
  @Transform(({ obj }) => obj.password && bcrpty.hashSync(obj.password, 10))
  passwordHash: string;
}
