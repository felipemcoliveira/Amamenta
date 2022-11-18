import * as cls from 'cls-hooked';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import configFactory from './database.config';
import { SyncDatabaseCommandRunner } from './commands/sync.command-runner';

const sequelizeClsNamespace = cls.createNamespace('Sequelize');
Sequelize.useCLS(sequelizeClsNamespace);

@Module({
  imports: [
    ConfigModule.forFeature(configFactory),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get<SequelizeModuleOptions>('sequelizeOptions');
      }
    })
  ],
  providers: [SyncDatabaseCommandRunner]
})
export class DatabaseModule {}
