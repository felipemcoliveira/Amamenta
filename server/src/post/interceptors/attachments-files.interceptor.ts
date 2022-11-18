import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import * as mime from 'mime';
import { v4 as uuid } from 'uuid';

import { ATTACHMENTS_PATH } from '../post.constants';

export const AttachmentFilesInterceptor = FilesInterceptor('attachments[]', 32, {
  storage: diskStorage({
    destination: ATTACHMENTS_PATH,
    filename: (req, file, cb) => {
      const extension = mime.getExtension(file.mimetype);
      const fileId = uuid();
      file['uuid'] = fileId;
      cb(null, `${fileId}.${extension}`);
    }
  })
});
