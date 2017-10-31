#!/usr/bin/env node --harmony

'use strict';

const { resolve } = require('path');

const program = require('commander');

const { forIn, readYaml } = require('./utils');

// -- Constants --------------- --- --  -

const TEST_COMPOSE_FILE = 'dc.test.yml';

// -- getTestVolumeNames --------------- --- --  -

/**
 * Returns the names of the test volumes.
 * @returns {Promise.<string[]>}
 */
const getTestVolumeNames = async () => {
  const composeFile = await readYaml(resolve(TEST_COMPOSE_FILE));
  const services = composeFile.services;
  let names = [];

  // e.g.: ${DX_VOLUMES}/test-store-panel:...
  const regexp = /\$\{DX_VOLUMES\}\/(.*)\:/;
  forIn(services, (serviceSpec, serviceName) => {
    const volumes = serviceSpec.volumes;
    if (volumes) {
      volumes.forEach((volume) => {
        const matches = regexp.exec(volume);
        if (matches) {
          names.push(matches[1])
        }
      });
    }
  });

  return names;
};

// -- CLI --------------- --- --  -

program
  .version('0.1.0')
  .parse(process.argv);

getTestVolumeNames(program)
  .then((names) => console.log(names.join(' ')))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
