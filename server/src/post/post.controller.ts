import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseFilters
} from '@nestjs/common';

import { PostService } from './post.service';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPageDto } from './dto/get-page.dto';

import { ALLOWED_ITEMS_PER_PAGE } from './post.constants';

import { Protected } from '../common/protected.decorator';
import { AuthenticatedUser } from '../auth/decorators/user.decorator';
import { PermissionIdentifiers } from '../permission/identifiers.enum';

import { CreatePostExceptionsFilter } from './exceptions-filters/create-post.exceptions-filter';
import { AttachmentFilesInterceptor } from './interceptors/attachments-files.interceptor';
import { ParseAttachmentsPipe } from './pipes/attachment-files.parser';

import type User from '../user/user.model';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseFilters(CreatePostExceptionsFilter)
  @Protected(PermissionIdentifiers.CanPublishPost)
  @UseInterceptors(AttachmentFilesInterceptor)
  async create(
    @AuthenticatedUser()
    user: User,
    @Body()
    createPostDto: CreatePostDto,
    @UploadedFiles(new ParseAttachmentsPipe())
    files: Array<Express.Multer.File>
  ) {
    return await this.postService.create(createPostDto, user, files);
  }

  @Patch(':id')
  @UseFilters(CreatePostExceptionsFilter)
  @Protected(PermissionIdentifiers.CanManageOwnPosts)
  @UseInterceptors(AttachmentFilesInterceptor)
  async update(
    @AuthenticatedUser()
    user: User,
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updatePostDto: UpdatePostDto,
    @UploadedFiles(new ParseAttachmentsPipe())
    files: Array<Express.Multer.File>
  ) {
    return await this.postService.update(id, user, updatePostDto, files);
  }

  @Get()
  getPagePosts(@Query() query: GetPageDto) {
    return this.postService.getPage(query);
  }

  @Get('/allowed-items-per-page')
  getAllowedItemsPerPage() {
    return ALLOWED_ITEMS_PER_PAGE;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOrFail(id);
  }

  @Delete(':id')
  @Protected(PermissionIdentifiers.CanManageOwnPosts)
  remove(@AuthenticatedUser() user: User, @Param('id', ParseIntPipe) id: number) {
    this.postService.delete(id, user);
  }
}
