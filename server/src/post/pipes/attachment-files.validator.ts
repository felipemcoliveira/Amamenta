import { FileValidator } from '@nestjs/common';

export interface AttachmentFilesValidatorOptions {
  maxSize: number;
  supportedMimeTypes: Array<string>;
}

export class AttachmentFilesValidator extends FileValidator<AttachmentFilesValidatorOptions> {
  buildErrorMessage(): string {
    return `Anexos não devem ser maiores que ${
      this.validationOptions.maxSize
    } bytes e serem de algum desses tipo: ${this.validationOptions.supportedMimeTypes.join()}`;
  }

  public isValid(files: Array<Express.Multer.File>): boolean {
    for (const file of files) {
      if (file.size > this.validationOptions.maxSize || this.validationOptions.supportedMimeTypes.indexOf(file.mimetype) < 0) {
        return false;
      }
    }
    return true;
  }
}
