import { Transform, TransformFnParams } from 'class-transformer';

export const ExcludeIfNull = (): PropertyDecorator => {
  return Transform((params: TransformFnParams) => {
    if (params.value !== null || params.value === undefined) {
      return params.value;
    }
  });
};
