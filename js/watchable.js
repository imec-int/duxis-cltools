#!/usr/bin/env node --harmony

'use strict';

const { resolve } = require('path');

const program = require('commander');

const getServiceSpecs = require('./utils/getServiceSpecs');

// -- Constants --------------- --- --  -

const COMPOSE_FILE = process.env.COMPOSE_FILE || 'docker-composer.yml';

// -- watchable --------------- --- --  -

/**
 * @param {string} name - The name of a name.
 * @returns {Promise.<int>}
 */
const watchable = async ({ args: [name], composefile }) => {
  if (!name) {
    throw new Error('Missing service name parameter.');
  }
  const serviceSpecs = await getServiceSpecs(resolve(composefile));
  const serviceSpec = serviceSpecs[name];
  let result = 0;
  if (serviceSpec && serviceSpec.manifest && serviceSpec.manifest.watchable) {
    if (serviceSpec.manifest.cargoApp) {
      result += 1;
    }
    if (serviceSpec.manifest.cargoFrontend) {
      result += 2;
    }
  }
  console.log(result);
};

// -- CLI --------------- --- --  -

program
  .version('0.1.0')
  .usage('[options] service')
  .option('--composefile [path]', `Specify the Compose file to use [${COMPOSE_FILE}].`, COMPOSE_FILE)
  .parse(process.argv);

watchable(program)
  // .then((names) => console.log(names.join(' ')))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
