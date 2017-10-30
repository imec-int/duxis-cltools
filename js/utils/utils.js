'use strict';

const child_process = require('child_process');
const fs = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');

const fse = require('fs-extra');
const yaml = require('js-yaml');
const { forIn, isBuffer, isString } = require('lodash');

// -- Export Lodash utils --------------- --- --  -

exports.forIn = forIn;

// -- Copied from `cargo-universal/utils/async` --------------- --- --  -

/**
 * Async sequential map.
 * @param {Iterable|Promise.<Iterable>} iterable
 * @param {function|Promise.<function>} callback
 * @returns {Promise.<Array>}
 * @throws when the callback throws on one of the values.
 *
 * @example <caption>Asynchronously load all files in './etc'</caption>
 * const { join } = require('path');
 * const { isFile, readDir, readFile } = require('cargo-service/utils/afs');
 * const { asyncFilter, asyncMap } = require('cargo-universal/utils');
 *
 * const data = await asyncMap(asyncFilter(asyncMap(readDir('/etc'), (n) => join('/etc', n)), isFile), readFile);
 */
const asyncMap = async (iterable, callback) => {
  iterable = await iterable;
  callback = await callback;
  const results = [];
  for (const el of iterable) {
    results.push(await callback(el));
  }
  return results;
};
exports.asyncMap = asyncMap;

/**
 * Async filter.
 * @param {Iterable|Promise.<Iterable>} iterable
 * @param {function|Promise.<function>} predicate
 * @returns {Promise.<Array>}
 *
 * @example <caption>Asynchronously load all files in './etc'</caption>
 * const { join } = require('path');
 * const { isFile, readDir, readFile } = require('cargo-service/utils/afs');
 * const { asyncFilter, asyncMap } = require('cargo-universal/utils');
 *
 * const data = await asyncMap(asyncFilter(asyncMap(readDir('/etc'), (n) => join('/etc', n)), isFile), readFile);
 */
const asyncFilter = async (iterable, predicate) => {
  iterable = await iterable;
  predicate = await predicate;
  const results = [];
  for (const el of iterable) {
    if (await predicate(el)) { results.push(el); }
  }
  return results;
};
exports.asyncFilter = asyncFilter;

/**
 * @typedef {object} AsyncForEachOptions
 * @property {boolean} [concurrent = false] - When true then call the delegates as soon as possible,
 *   else call the next one when the previous one returned or throws.
 * @property {boolean} [ignoreErrors = false] - When true then execute all regardless of errors,
 *   else throw when one of the delegates throws.
 * @property {*} [thisArg] - Value to use as `this` when executing the delegate.
 */

/**
 * Async function that calls the given async callback for each item in the given iterable,
 * sequentially.
 * @param {Iterable|Promise.<Iterable>} iterable
 * @param {function|Promise.<function>} callback
 * @param {AsyncForEachOptions} options
 */
const asyncForEach = async (iterable, callback, options = {}) => {
  iterable = await iterable;
  callback = await callback;
  const { concurrent = false, ignoreErrors = false, thisArg } = options;
  let index = 0;
  if (concurrent) {
    return new Promise(async (resolve, reject) => {
      let toComplete = 0;
      let index = 0;
      iterable.forEach(async (el) => {
        toComplete++;
        try {
          await callback.call(thisArg, el, index++);
        }
        catch (error) {
          if (!ignoreErrors) {
            reject(error);
          }
        }
        if (--toComplete === 0) { resolve(); }
      });
      if (toComplete === 0) { resolve(); }
    });
  }
  else {
    for (const el of iterable) {
      await callback.call(thisArg, el, index++);
    }
  }
};
exports.asyncForEach = asyncForEach;

/**
 * Async function that calls the given async callback for each key/value pair in the given object or
 * map.
 * @param {object|Map|Promise.<object|Map>} object
 * @param {function|Promise.<function>} callback
 */
const asyncForIn = async (object, callback) => {
  object = await object;
  callback = await callback;
  if (object instanceof Map) {
    for (const key of object.keys()) {
      await callback(object.get(key), key);
    }
  }
  else {
    for (const key of Object.keys(object)) {
      await callback(object[key], key);
    }
  }
};
exports.asyncForIn = asyncForIn;

/**
 * Asynchronous `reduce`.
 *
 * @param {Array<*>|Promise.<Array.<*>>} array
 * @param {function|Promise.<function>} callback - Same as for regular `reduce` function.
 * @param {*|Promise.<*>} [initialValue] - Value to use as the first argument to the first call of the callback.
 *   If no initial value is supplied, the first element in the array will be used. Calling reduce on
 *   an empty array without an initial value is an error.
 * @returns {Promise.<*>} The value that results from the reduction.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
 */
const asyncReduce = async (array, callback, initialValue) => {
  array = await array;
  callback = await callback;
  let accumulator = (await initialValue) || array[0];

  await asyncForEach(array, async (currentValue, currentIndex) => {
    accumulator = await callback(accumulator, currentValue, currentIndex, array);
  });

  return accumulator;
};
exports.asyncReduce = asyncReduce;

// -- Copied from `cargo-service/utils/afs` --------------- --- --  -

/**
 * Asynchronous asserts that the given path is a file.
 * @param {string} path
 * @throws {Error} when the given path is not a file
 */
const assertFile = async (path) => {
  assertStringOrBuffer(path);
  if (!(await isFile(path))) {
    throw new Error(`The path '${path}' is not a file.`);
  }
};
exports.assertFile = assertFile;

const assertStringOrBuffer = (path) => {
  if (!isString(path) && !isBuffer(path)) {
    throw new RangeError(`The given path must be a string or buffer, instead got '${path}'.`);
  }
};
exports.assertStringOrBuffer = assertStringOrBuffer;

const isDirectory = async (path) => {
  try {
    return (await stat(path)).isDirectory();
  }
  catch (error) {
    return false;
  }
};
exports.isDirectory = isDirectory;

const isFile = async (path) => {
  try {
    return (await stat(path)).isFile();
  }
  catch (error) {
    return false;
  }
};
exports.isFile = isFile;

const readYaml = async (path) => {
  return yaml.safeLoad(await readFile(path));
};
exports.readYaml = readYaml;

exports.writeYaml = async (path, data, options) => {
  return await writeFile(path, yaml.safeDump(data, options));
};

// -- Promisified Node.js util functions --------------- --- --  -

exports.execFile = promisify(child_process.execFile);

// -- Promisified Node.js fs functions --------------- --- --  -

exports.copyFile = promisify(fs.copyFile);

exports.readDir = promisify(fs.readdir);

const readFile = promisify(fs.readFile);
exports.readFile = readFile;

const stat = promisify(fs.stat);
exports.stat = stat;

const writeFile = promisify(fs.writeFile);
exports.writeFile = writeFile;

// -- fs-extra functions --------------- --- --  -

exports.copy = fse.copy;
exports.ensureDir = fse.ensureDir;
exports.exists = fse.exists;
exports.readJson = fse.readJson;
exports.rmrf = fse.remove;

// -- New --------------- --- --  -

exports.hasDuxisManifest = async (imagePath) => {
  if (await isDirectory(imagePath)) {
    const cargoPath = resolve(imagePath, 'cargo.yaml');
    return await isFile(cargoPath);
  }
};

exports.readDuxisManifest = async (imagePath) => {
  if (await isDirectory(imagePath)) {
    const cargoPath = resolve(imagePath, 'cargo.yaml');
    if (await isFile(cargoPath)) {
      return await readYaml(cargoPath);
    }
  }
};
