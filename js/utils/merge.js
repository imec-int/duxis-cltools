'use strict';

/* eslint-disable import/no-commonjs */

// TODO: use merge from dxf-universal package

const { isFunction, isMap, isPlainObject, isSet } = require('lodash');

/**
 * Merge the given arguments recursively, non-destructively, and with optional custom behaviour.
 *
 * There are several options for merging objects in one way or another, such as `Object.assign()`,
 * `lodash.defaults()` or `jQuery.extend()`. There are even some tools to recursively or 'deeply'
 * merge objects, such as `lodash.defaultsDeep(). Here the question becomes what one should do with
 * arrays. Should one be replaced by the other or should they be merged? What if one wants to merge
 * aspects conditionally. This function attempts to addresses these requirements with a simple
 * approach: provide reasonable default behaviour, and when a property to merge has a function as
 * value, then the result of calling this function is used.
 *
 * The objects are merged pairwise from left to right. When there are for instance three arguments
 * (A, B, C), then first A & B are pairwise-merged, the result of which is then pairwise-merged with
 * C. The result is always a new object. The given objects are not modified.
 *
 * When pairwise-merging two values (A, B), then A is considered the _target_, while B is considered
 * the _source_. The source and target values are merged according to the following (ordered) rules:
 *
 *  1) When the target is null or undefined, then the source is returned;
 *  2) When the source is undefined, then the target is returned;
 *  3) When the source is null, then the result is null (explicitly null'ed);
 *  4) When both values are arrays, then the result is the concatenation of both arrays;
 *  5) When both values are Map objects, then the result is a new Map that contains the key-value
 *     pairs of both, where for keys that occur in both, the value is merged recursively. Source map
 *     keys for which the merged value is null are not included in the merged map.
 *  6) When both values are Set objects, then the result is a new Set that contains the values from
 *     both;
 *  7) TODO: When the source is a Map and the target is a regular Object,
 *  8) TODO: When the source is a regular Objectd and the target is a Map,
 *  9) TODO: When the source is a Set and the target is an Array,
 * 10) TODO: When the source is an Array and the target is a Set,
 * 11) When the source is a function, then this function is called with the target value as sole
 *     argument, and its return value becomes the merge result.
 * 12) When both values are basic objects, then the result is a new object that contains the
 *     properties of both, merged recursively. Source object properties for which the merged value
 *     is null are not included in the merged object.
 * 13) In all other cases, the source value is the result;
 */
const merge = (...objects) => {
  if (objects.length < 2) {
    throw new RangeError(`Expected at least two arguments, got ${objects.length}.`);
  }
  if (objects.length === 2) {
    if (objects[0] === undefined) { return objects[1]; }
    if (objects[1] === undefined) { return objects[0]; }
    if (objects[0] === null) { return objects[1]; }
    if (objects[1] === null) { return objects[0]; }
    return _mergePairwise(objects[0], objects[1]);
  }
  else {
    return merge(_mergePairwise(objects[0], objects[1]), ...objects.slice(2));
  }
};

const _mergePairwise = (target, source) => {
  if (target === undefined) { return source; }
  if (source === undefined) { return target; }
  if (target === null) { return source; }
  if (source === null) { return target; }
  if (Array.isArray(target) && Array.isArray(source)) {
    // return target.concat(source);
    return target.concat(source.filter((val) => !target.includes(val)));
  }
  if (isMap(target) && isMap(source)) {
    const result = new Map(target.entries());
    source.forEach((value, key) => {
      if (target.has(key)) {
        const mergedVal = _mergePairwise(target.get(key), value);
        if (mergedVal === undefined) {
          result.delete(key);
        }
        else {
          result.set(key, mergedVal);
        }
      }
      else {
        result.set(key, value);
      }
    });
    return result;
  }
  if (isSet(target) && isSet(source)) {
    const result = new Set(target.values());
    source.forEach((value) => result.add(value));
    return result;
  }
  if (isFunction(source)) {
    return source(target);
  }
  if (isPlainObject(target) && isPlainObject(source)) {
    const result = Object.assign({}, target);
    Object.keys(source).forEach((key) => {
      if (result[key] === undefined) {
        result[key] = source[key];
      }
      else {
        const mergedVal = _mergePairwise(target[key], source[key]);
        if (mergedVal === undefined) {
          delete result[key];
        }
        else {
          result[key] = mergedVal;
        }
      }
    });
    return result;
  }
  return source;
};

module.exports = merge;
