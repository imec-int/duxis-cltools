#!/usr/bin/env node --harmony

'use strict';

const { resolve } = require('path');

const program = require('commander');

const { getServiceSpecs } = require('./utils');

// -- Constants --------------- --- --  -

const COMPOSE_FILE = process.env.COMPOSE_FILE || 'docker-composer.yml';

// -- getServiceNames --------------- --- --  -

/**
 * Returns the names of the services declared in the default or given Compose file.
 *
 * @param {string} [composeFile] - The name of the Compose file to use. Defaults to the value of the
 *   `COMPOSE_FILE` environment variable, or `dc.prod.yml`.
 * @param {boolean} [front = false] - Filter the names of front services.
 * @param {string} [test] - Get the test-service names for the given service.
 * @param {boolean} [testable = false] - Filter the names of testable services.
 * @param {boolean} [watchable = false] - Filter the names of watchable services.
 *
 * @returns {Promise.<string[]>}
 */
const getServiceNames = async ({ composefile, front, test, testable, watchable }) => {
  if (test) {
    const services = await getServiceSpecs(resolve(composefile));
    let service = services[test];
    if (!service) {
      service = services[`test-${test}`];
      if (!service) {
        throw new Error(`There is no '${test}' or 'test-${test}' service.`);
      }
    }
    let names = [`test-${test}`];
    const hasUnitTests = service.manifest && service.manifest.unitTests && service.manifest.unitTests.enable;
    if (hasUnitTests && service.manifest.unitTests.dependencies) {
      names = names.concat(service.manifest.unitTests.dependencies);
    }
    return names;
  }
  else {
    const services = await getServiceSpecs(resolve(composefile));
    let names = Object.keys(services);

    if (front) {
      names = names.filter((name) => {
        return services[name] &&
          services[name].manifest &&
          services[name].manifest.cargoFrontend;
      });
    }

    if (watchable) {
      names = names.filter((name) => {
        return services[name] &&
          services[name].manifest &&
          services[name].manifest.watchable;
      });
    }

    if (testable) {
      names = names
        .filter((name) => {
          return services[name] &&
            services[name].manifest &&
            services[name].manifest.unitTests &&
            services[name].manifest.unitTests.enable;
        })
        .map((name) => services[name].manifest.service)
    }

    return names;
  }
};

// -- CLI --------------- --- --  -

program
  .version('0.1.0')
  .option('--composefile [path]', `Specify the Compose file to use [${COMPOSE_FILE}].`, COMPOSE_FILE)
  .option('--front', 'Filter the names of front services.')
  .option('--test [service]', 'Get the test-service names for the given service.')
  .option('--testable', 'Filter the names of testable services.')
  .option('--watchable', 'Filter the names of watchable services.')
  .parse(process.argv);

getServiceNames(program)
  .then((names) => console.log(names.join(' ')))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
