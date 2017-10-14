'use strict';

const { dirname, resolve } = require('path');

const readComposeFile = require('./readComposeFile');
const { asyncForEach, hasDuxisManifest, readDuxisManifest } = require('./utils');

/**
 * @name getServiceSpecs
 * Returns an object with the extended Duxis services from the given Docker Compose file. The
 * service objects' `manifest` properties hold the corresponding Duxis Manifest objects.
 *
 * @todo Users can request the service spec (including the manifest) for a single service.
 *
 * @param {string} path - [Path = process.env.COMPOSE_FILE] to the Compose file.
 * @returns {Promise.<object>}
 */
module.exports = async (path = process.env.COMPOSE_FILE) => {
  const composeFile = await readComposeFile(path, { includeXFields: true });
  const services = {};
  await asyncForEach(Object.keys(composeFile.services), async (serviceName) => {
    const service = composeFile.services[serviceName];
    services[serviceName] = service;

    // Add manifest when provided:
    if (service.build && service.build.context) {
      const imagePath = resolve(dirname(path), service.build.context);
      if (await hasDuxisManifest(imagePath)) {
        service.manifest = await readDuxisManifest(imagePath);
      }
    }
  });
  // console.log('- services:', services);
  return services;
};
