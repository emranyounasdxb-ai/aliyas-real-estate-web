const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = __dirname;
const directory = fs.realpathSync(path.join(root, 'current'));
const environment = JSON.parse(fs.readFileSync(path.join(root, 'environment.json'), 'utf8'));
Object.assign(process.env, environment, {
  NODE_ENV: 'production',
  HOSTNAME: '127.0.0.1',
  ALIYAS_RELEASE: path.basename(directory),
});
process.chdir(directory);
import(pathToFileURL(path.join(directory, 'server.js')).href).catch(error => {
  console.error('Aliyas application could not start:', error.message);
  process.exit(1);
});
