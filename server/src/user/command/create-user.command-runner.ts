import * as chalk from 'chalk';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Command, CommandRunner, Option } from 'nest-commander';
import { PermissionService } from '../../permission/permission.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserService } from '../user.service';

@Command({ name: 'user:create', arguments: '<email> <password> <firstName> <secondName>' })
export class CreateUserCommandRunner extends CommandRunner {
  constructor(private readonly userService: UserService, private readonly permissionService: PermissionService) {
    super();
  }

  async run(inputs: string[], options: Record<string, any>): Promise<void> {
    console.clear();
    const [email, password, firstName, lastName] = inputs;
    const dto = plainToInstance(CreateUserDto, {
      email,
      password,
      firstName,
      lastName
    });

    if (options.permissions) {
      let isPermissionsValid = true;
      for (const permission of options.permissions) {
        try {
          await this.permissionService.findByIdentifierOrFail(permission);
        } catch (error) {
          console.error(chalk.red(`Permissão invalída: ${permission}`));
          isPermissionsValid = false;
        }
      }

      if (!isPermissionsValid) {
        return;
      }
    }

    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      console.error(chalk.red.inverse(' Erro na validação dos argumentos: \n'));

      for (const validationError of validationErrors) {
        console.error(chalk.red.inverse(` Argumento: ${validationError.property} `));
        for (const constraint in validationError.constraints) {
          console.error(chalk.red(` ${validationError.constraints[constraint]}`));
        }
      }

      return;
    }

    console.log('Criando usuário...');

    try {
      const createdUser = await this.userService.create(dto);
      console.clear();
      console.log(chalk.greenBright('Usuário criado com sucesso'));
      console.log(chalk.greenBright(`- ID: ${createdUser.id}`));
      console.log(chalk.greenBright(`- Email: ${createdUser.email}`));
      console.log(chalk.greenBright(`- Nome completo: ${createdUser.firstName} ${createdUser.lastName}`));

      if (options.permissions) {
        await this.permissionService.updateUserPermissions(createdUser.id, options.permissions);
        console.log(chalk.greenBright('Permissões concedidas com sucesso.'));
      }
    } catch (error) {
      console.clear();
      console.error(chalk.redBright('Não foi possível criar o usuário:'));
      console.error(chalk.redBright(error.message));
    }
  }

  @Option({
    flags: '-p, --permissions <permissions>',
    description: 'Permissões do usuário. (ex.: "CAN_MANAGE_USERS, CAN_MANAGE_PERMISSIONS"'
  })
  parsePermissions(val: string) {
    return val.split(',').map((p) => p.trim());
  }
}
