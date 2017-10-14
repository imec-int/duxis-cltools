#!/usr/bin/env node --harmony

const { resolve } = require('path');

const program = require('commander');

const { readYaml } = require('./utils');

// -- Constants --------------- --- --  -

const PROD_COMPOSE_FILE = 'dc.prod.yml';
const COMPOSE_FILE = process.env.COMPOSE_FILE || PROD_COMPOSE_FILE;
const COMPOSE_PROJECT_NAME = process.env.COMPOSE_PROJECT_NAME;

// -- getNetworkNames --------------- --- --  -

/**
 * Returns the names of the non-external networks declared in the default or given Compose file.
 * @param {string} [composeFile] - The name of the Compose file to use. Defaults to the value of the
 *   `COMPOSE_FILE` environment variable, or `dc.prod.yml`.
 * @returns {Promise.<string[]>}
 */
const getNetworkNames = async ({ composefile, prepend }) => {
  const composeFile = await readYaml(resolve(composefile));
  const networks = composeFile.networks;
  let names = Object.keys(networks);

  names = names.filter((name) => {
    return networks[name] && !networks[name].external
  });

  if (prepend) {
    names = names.map((name) => `${COMPOSE_PROJECT_NAME}_${name}`);
  }

  return names;
};

// -- CLI --------------- --- --  -

program
  .version('0.1.0')
  .option('--composefile [path]', `Specify the Compose file to use [${COMPOSE_FILE}].`, COMPOSE_FILE)
  .option('--prepend', 'Prepend the compose-project-name.')
  .parse(process.argv);

getNetworkNames(program)
  .then((names) => console.log(names.join(' ')))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
