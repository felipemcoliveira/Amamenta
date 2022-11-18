import * as chalk from 'chalk';

import { Command, CommandRunner, Option } from 'nest-commander';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PermissionIdentifiers } from '../../permission/identifiers.enum';

@Command({ name: 'db:sync' })
export class SyncDatabaseCommandRunner extends CommandRunner {
  constructor(private readonly sequelize: Sequelize) {
    super();
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    console.clear();
    console.log('Sincronizando banco de dados...');

    if (options.force && process.env.NODE_ENV === 'production') {
      console.error('Opção force não pode ser usado em ambiente de produção.');
      return;
    }

    await this.sequelize.sync({ force: options.force });

    for (const permissionIdentifer of Object.values(PermissionIdentifiers)) {
      await this.sequelize.query('INSERT IGNORE INTO permission(identifier) VALUE (?)', {
        type: QueryTypes.INSERT,
        replacements: [permissionIdentifer]
      });
    }

    console.clear();
    console.log(chalk.greenBright('Banco sincronizado com sucesso.'));
  }

  @Option({
    flags: '-f, --force',
    description: 'Forçar sincronização do banco.'
  })
  parseForce() {
    return true;
  }
}
