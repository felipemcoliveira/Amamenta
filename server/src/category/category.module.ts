import { Module } from '@nestjs/common';

import { PermissionModule } from '../permission/permission.module';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { SequelizeModule } from '@nestjs/sequelize';

import Category from './models/category.model';

@Module({
  imports: [PermissionModule, SequelizeModule.forFeature([Category])],
  exports: [SequelizeModule, CategoryService],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
