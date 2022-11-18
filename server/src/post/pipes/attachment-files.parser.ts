import { ParseFilePipe } from '@nestjs/common';
import { AttachmentFilesValidator } from './attachment-files.validator';

export class ParseAttachmentsPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new AttachmentFilesValidator({
          maxSize: 2 * 1024 * 1024,
          supportedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/avi', 'image/webp', 'image/gif']
        })
      ]
    });
  }
}
