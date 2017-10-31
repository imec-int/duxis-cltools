'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { execFile } = require('../js/utils');

describe('getServiceNames', function () {
  const assert = chai.assert;
  const getServiceNamesPath = resolve(__dirname, '../js/getServiceNames.js');
  const projectDir = resolve(__dirname, 'fixtures/project-a');

  async function getServiceNames(args = [], dcFile, expected) {
    const { stdout, stderr } = await execFile(getServiceNamesPath, args, {
      cwd: projectDir,
      env: { ...process.env, COMPOSE_FILE: dcFile }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    assert.deepEqual(stdout.trim().split(' ').filter(n => n.length).sort(), expected.sort());
  }

  describe('get all service names:', function () {
    const prodNames = ['back-a', 'back-b', 'back-c', 'ext-a', 'front-a', 'front-b', 'store-a'];
    const testNames = ['test-back-a', 'test-back-b', 'test-store-a'];

    it('COMPOSE_FILE = dc.prod.yml', async () => {
      await getServiceNames([], 'dc.prod.yml', prodNames);
    });

    it('COMPOSE_FILE = dc.test.yml', async () => {
      await getServiceNames([], 'dc.test.yml', testNames);
    });

    it('--composefile = dc.prod.yml', async () => {
      await getServiceNames(['--composefile', 'dc.prod.yml'], undefined, prodNames);
    });

    it('--composefile = dc.test.yml', async () => {
      await getServiceNames(['--composefile', 'dc.test.yml'], undefined, testNames);
    });

  });

  describe('get front service names:', function () {
    const prodNames = ['front-a', 'front-b'];
    const testNames = [];

    it('COMPOSE_FILE = dc.prod.yml', async () => {
      await getServiceNames(['--front'], 'dc.prod.yml', prodNames);
    });

    it('COMPOSE_FILE = dc.test.yml', async () => {
      await getServiceNames(['--front'], 'dc.test.yml', testNames);
    });

    it('--composefile = dc.prod.yml', async () => {
      await getServiceNames(['--front', '--composefile', 'dc.prod.yml'], undefined, prodNames);
    });

    it('--composefile = dc.test.yml', async () => {
      await getServiceNames(['--front', '--composefile', 'dc.test.yml'], undefined, testNames);
    });

  });

  describe('get testable service names:', function () {
    const prodNames = ['back-a', 'back-b'];
    const testNames = ['back-a', 'back-b'];

    it('COMPOSE_FILE = dc.prod.yml', async () => {
      await getServiceNames(['--testable'], 'dc.prod.yml', prodNames);
    });

    it('COMPOSE_FILE = dc.test.yml', async () => {
      await getServiceNames(['--testable'], 'dc.test.yml', testNames);
    });

    it('--composefile = dc.prod.yml', async () => {
      await getServiceNames(['--testable', '--composefile', 'dc.prod.yml'], undefined, prodNames);
    });

    it('--composefile = dc.test.yml', async () => {
      await getServiceNames(['--testable', '--composefile', 'dc.test.yml'], undefined, testNames);
    });

  });

  describe('get all watchable service names:', function () {
    const prodNames = ['back-a', 'back-c', 'front-a'];
    const testNames = ['back-a', 'back-b'];

    it('COMPOSE_FILE = dc.prod.yml', async () => {
      await getServiceNames(['--watchable'], 'dc.prod.yml', prodNames);
    });

  });

  describe('get test (and dependent) service names for:', function () {

    it('back-a in dc.prod.yml', async () => {
      await getServiceNames(['--test', 'back-a'], 'dc.prod.yml', [
        'test-back-a',
        'test-store-a'
      ]);
    });

    it('back-b in dc.prod.yml', async () => {
      await getServiceNames(['--test', 'back-b'], 'dc.prod.yml', [
        'test-back-b'
      ]);
    });

    it('back-a in dc.test.yml', async () => {
      await getServiceNames(['--test', 'back-a'], 'dc.test.yml', [
        'test-back-a',
        'test-store-a'
      ]);
    });

    it('back-b in dc.test.yml', async () => {
      await getServiceNames(['--test', 'back-b'], 'dc.test.yml', [
        'test-back-b'
      ]);
    });

  });

});
