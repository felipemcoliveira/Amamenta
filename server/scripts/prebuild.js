const { exec } = require('child_process');
const { config } = require('dotenv');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const chalk = require('chalk');

// ------------------------------------------------------------------------------------------------------------
// Load Environment Variables
// ------------------------------------------------------------------------------------------------------------

config({ path: './.env.production' });
config();

// ------------------------------------------------------------------------------------------------------------
// Logging Helper
// ------------------------------------------------------------------------------------------------------------

let hadError = false;
function log(...args) {
  if (hadError) {
    return;
  }
  console.log(chalk.green.bold(...args));
}

function logError(...args) {
  if (!hadError) {
    console.clear();
    console.log(chalk.bgRed('Error\n'));
    hadError = true;
  }
  console.log(chalk.red.bold(...args));
}

// ------------------------------------------------------------------------------------------------------------
// Entry
// ------------------------------------------------------------------------------------------------------------

console.clear();
console.log(chalk.bgGreen('Prebuild\n'));

if (fs.existsSync('./dist')) {
  log("Deleting 'dist' directory.");
  fs.rmSync('./dist', { recursive: true, force: true });
}

console.log(new URL('./admin', process.env.PUBLIC_URL).href);
buildClient('../admin', './client/admin', { PUBLIC_URL: '/admin' });
buildClient('../blog', './client/blog');

// ------------------------------------------------------------------------------------------------------------
// Misc Helper Functions
// ------------------------------------------------------------------------------------------------------------

async function buildClient(appPath, destPath, env = undefined) {
  // install dependencies and build the project
  await executeClientCommand(appPath, 'npm run build', env);

  // copy the files from the build to server folder
  const buildPath = path.join(appPath, '/build');
  fs.rmSync(destPath, { recursive: true, force: true });
  log(`Copying files from '${path.resolve(buildPath)}' to '${path.resolve(destPath)}'.`);
  fse.copySync(buildPath, destPath);
}

async function executeClientCommand(appPath, command, env = undefined) {
  return new Promise((resolve, reject) => {
    log(`Executing '${command}' on '${path.resolve(appPath)}'.`);
    exec(
      command,
      {
        cwd: path.resolve(appPath),
        env: { ...process.env, ...env, GENERATE_SOURCEMAP: false }
      },
      (error, _, stderr) => {
        if (error) {
          process.exitCode = error.status;
          logError(stderr);
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}
