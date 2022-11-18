import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import * as fs from 'fs';
import { Request } from 'express';

/** This filter extends BaseExceptionFilter's behaviour, but it additionally deletes files created during the request. */
@Catch()
export class CreatePostExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest() as Request;

    if (req.files) {
      for (const file of req.files as Array<Express.Multer.File>) {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          error && Logger.error(`Unable to delete the file "${file.path}". (Error: ${error.message})`);
        }
      }
    }
    super.catch(exception, host);
  }
}
