import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { FindOptions, Op, WhereOptions } from 'sequelize';

import { Sequelize } from 'sequelize-typescript';

import * as fs from 'fs';
import * as path from 'path';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPageDto } from './dto/get-page.dto';
import { PageDto } from './dto/page.dto';

import { UserService } from '../user/user.service';

import { PermissionIdentifiers } from '../permission/identifiers.enum';

import { ATTACHMENTS_PATH } from './post.constants';

import User from '../user/user.model';
import Post from './models/post.model';
import Category from '../category/models/category.model';
import PostAttachment from './models/post-attachement.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post)
    private readonly postModel: typeof Post,
    @InjectModel(PostAttachment)
    private readonly postAttachmentModel: typeof PostAttachment,
    private readonly userService: UserService,
    private readonly sequelize: Sequelize
  ) {}

  async create(createPostDto: CreatePostDto, author: User, files: Array<Express.Multer.File>): Promise<Post> {
    return this.sequelize.transaction(async () => {
      const createdPost = await this.postModel.create({
        ...createPostDto,
        attachmentInstanceCount: files.length,
        authorId: author.id
      });

      await this.postAttachmentModel.bulkCreate(
        files.map((attachment, index) => {
          return {
            attachedToPostId: createdPost.id,
            mimeType: attachment.mimetype,
            instanceId: index,
            fileId: attachment['uuid']
          };
        })
      );

      return createdPost;
    });
  }

  async getPage(query: GetPageDto): Promise<PageDto> {
    const where: WhereOptions<Post> = {};
    if (query.authorId) {
      where.authorId = query.authorId;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const postsPromise = this.postModel.findAll({
      limit: query.itemsPerPage,
      offset: query.itemsPerPage * query.page,
      order: [['id', 'DESC']],
      include: [{ model: User, as: 'author' }, Category, PostAttachment],
      where
    });

    const postCountPromise = this.postModel.count({ where });
    const [posts, postCount] = await Promise.all([postsPromise, postCountPromise]);

    const dto = new PageDto();
    dto.itemsPerPage = query.itemsPerPage;
    dto.pageCount = Math.ceil(postCount / query.itemsPerPage);
    dto.page = query.page;
    dto.posts = posts;
    return dto;
  }

  async findOrFail(id: number): Promise<Post> {
    const post = await this.postModel.findByPk(id, {
      include: [{ model: User, as: 'author' }, Category, PostAttachment]
    });
    if (!post) throw new NotFoundException();
    return post;
  }

  async update(
    id: number,
    requestingUser: User,
    updatePostDto: UpdatePostDto,
    files: Array<Express.Multer.File>
  ): Promise<Post> {
    const [post, removedAttachments] = await this.sequelize.transaction(async () => {
      const post = await this.getPostForEdit(id, requestingUser);

      const unreferrencedAttchmentsFindOptions: FindOptions<PostAttachment> = {
        where: {
          instanceId: { [Op.notIn]: updatePostDto.referencedAttachments }
        }
      };

      const removedAttachments = await this.postAttachmentModel.findAll(unreferrencedAttchmentsFindOptions);
      await this.postAttachmentModel.destroy(unreferrencedAttchmentsFindOptions);

      await this.postAttachmentModel.bulkCreate(
        files.map((attachment, index) => {
          return {
            attachedToPostId: post.id,
            mimeType: attachment.mimetype,
            instanceId: post.attachmentInstanceCount + index,
            fileId: attachment['uuid']
          };
        })
      );

      await post.update({
        ...updatePostDto,
        attachmentInstanceCount: post.attachmentInstanceCount + files.length
      });

      return [post, removedAttachments];
    });

    for (const removedAttachment of removedAttachments) {
      const filePath = path.join(ATTACHMENTS_PATH, removedAttachment.filename);
      this.deleteAttchmentFile(filePath);
    }
    return post;
  }

  deleteAttchmentFile(filePath: string) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      Logger.error(`Unable to delete the file "${filePath}":`);
      Logger.error(error.message);
    }
  }

  async delete(id: number, requestingUser: User): Promise<void> {
    const post = await this.getPostForEdit(id, requestingUser);
    await post.destroy();
  }

  private async getPostForEdit(id: number, requestingUser: User): Promise<Post> {
    const post = await this.findOrFail(id);
    const ownerId = post.getOwnerId();

    if (ownerId !== requestingUser.id) {
      const canManageAnyPosts = await this.userService.hasPermission(requestingUser, PermissionIdentifiers.CanManageAnyPosts);

      if (!canManageAnyPosts) {
        throw new ForbiddenException();
      }
    }
    return post;
  }
}
