import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as path from 'path';

import { UserModule } from '../user/user.module';
import { DatabaseModule } from '../database/database.module';
import { PermissionModule } from '../permission/permission.module';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { PostModule } from '../post/post.module';

import envConfigFactory from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [envConfigFactory] }),
    MulterModule.register({ dest: './static' }),
    DatabaseModule,
    PermissionModule,
    UserModule,
    AuthModule,
    CategoryModule,
    PostModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve('../client/admin/build'),
      serveRoot: '/admin',
      serveStaticOptions: { index: false }
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve('../client/blog/build'),
      exclude: ['admin/*', 'static/*', 'api/*']
    })
  ]
})
export class AppModule {}
