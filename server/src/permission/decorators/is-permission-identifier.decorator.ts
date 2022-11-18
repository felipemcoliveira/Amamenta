import { Matches } from 'class-validator';

export const IDENTIFIER_VALIDATION_MESSAGE =
  'Nome da permissão inválido. ' +
  'O nome deve conter apenas letras maiúsculas e o símbolo underscore (_) ' +
  'e ter um comprimento de 3 a 64 caractérios.';

export const IDENTIFIER_REGEX = /^[A-Z_]{3,64}$/;

export const IsPermissionIdentifier = (options = {}): PropertyDecorator => {
  return (target, key) => {
    Matches(IDENTIFIER_REGEX, { message: IDENTIFIER_VALIDATION_MESSAGE, ...options })(target, key);
  };
};
