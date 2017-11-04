const { basename, dirname, resolve } = require('path');

const { isPlainObject } = require('lodash');

const merge = require('./merge');
const { asyncForEach, assertFile, readYaml } = require('./utils');

/**
 * @name readComposeFile
 * Returns the extended content of the given Docker Compose file as a Javascript object.
 * @param {string} path
 * @param {boolean} [enableExtends = true] When true, then the `x-extends` field is resolved similar
 *   to the `extends` field in the Compose file format v2.
 * @param {boolean} [includeXFields = false] When true then custom properties (prefixed with `x-`)
 *   will be included in the returned Compose configuration object. Note that support for such
 *   custom fields is expected for v3.4 of the Compose file format.
 * @returns {Promise.<object>}
 */
module.exports = async (path, { enableExtends = true, includeXFields = false } = {}) => {
  // console.log('>> readComposeFile - path:', path, { enableExtends, includeXFields });
  assertFile(path);
  let composeFile;
  if (enableExtends) {
    const cache = {};
    composeFile = await _readComposeFileRec(path, cache);
    if (composeFile.services) {
      await asyncForEach(Object.keys(composeFile.services), async (serviceName) => {
        composeFile.services[serviceName] = await _getExtendedService(path, serviceName, cache);
      });
    }
  }
  else {
    composeFile = await readYaml(path);
  }

  if (!includeXFields) {
    return _clearXFieldsRec(composeFile);
  }
  return composeFile;
};

const _clearXFieldsRec = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    if (key.startsWith('x-')) { return; }
    if (isPlainObject(obj[key])) {
      result[key] = _clearXFieldsRec(obj[key]);
    }
    else {
      result[key] = obj[key];
    }
  });
  return result;
};

const _readComposeFileRec = async (path, cache) => {
  if (cache[path]) {
    return cache[path].file;
  }

  const composeFile = await readYaml(path);
  cache[path] = {
    file: composeFile,
    services: {}
  };
  return composeFile;
};

const _getExtendedService = async (path, serviceName, cache) => {
  if (!cache[path]) {
    await _readComposeFileRec(path, cache);
  }
  const { file, services } = cache[path];

  if (!services[serviceName]) {
    let service = file.services[serviceName];
    if (!service) {
      throw new Error(`There is no '${serviceName}' service in '${path}'.`);
    }
    const extendsSpec = service['extends'];
    if (extendsSpec) {
      const extendsPath = extendsSpec.file ? resolve(dirname(path), extendsSpec.file) : path;
      const extendsName = extendsSpec.service || serviceName;
      const baseService = await _getExtendedService(extendsPath, extendsName, cache);
      const extendedService = merge(baseService, service);

      if (JSON.parse(process.env.LOG_COMPOSE_EXTENDS || '0')) {
        console.log('# Extending service:');
        console.log('  - service:', service);
        console.log('  - base:', baseService);
        console.log('  - extended:', extendedService);
      }

      services[serviceName] = extendedService;
    }
    else {
      services[serviceName] = service;
    }
  }

  return services[serviceName];
};
