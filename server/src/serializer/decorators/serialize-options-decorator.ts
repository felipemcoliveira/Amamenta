import { SetMetadata } from '@nestjs/common';

import { SerializerOptions } from '../serializer.interfaces';

import { SERIALIZER_OPTIONS } from '../serializer.constants';

export const SerializeOptions = (options: SerializerOptions) => SetMetadata(SERIALIZER_OPTIONS, options);
