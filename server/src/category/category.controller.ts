import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ConflictException
} from '@nestjs/common';

import { CategoryService } from './category.service';

import { Protected } from '../common/protected.decorator';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { PermissionIdentifiers } from '../permission/identifiers.enum';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.findOneOrFail(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Protected(PermissionIdentifiers.CanManageCategories)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    if (await this.categoryService.findByName(createCategoryDto.name)) {
      throw new ConflictException(`Já existe uma categoria com o nome \"${createCategoryDto.name}\".`);
    }
    return this.categoryService.create(createCategoryDto);
  }

  @Patch(':id')
  @Protected(PermissionIdentifiers.CanManageCategories)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    if ('name' in updateCategoryDto) {
      const c0 = await this.categoryService.findByName(updateCategoryDto.name);
      if (c0.id !== id) {
        throw new ConflictException(`Já existe uma categoria com o nome \"${updateCategoryDto.name}\".`);
      }
    }
    const category = await this.categoryService.findOneOrFail(id);
    await this.categoryService.update(category, updateCategoryDto);
    return category;
  }

  @Delete(':id')
  @Protected(PermissionIdentifiers.CanManageCategories)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryService.findOneOrFail(id);
    await this.categoryService.delete(category);
    return {};
  }
}
