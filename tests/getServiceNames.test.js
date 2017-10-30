'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { execFile } = require('../js/utils');

const assert = chai.assert;

// console.log('- __dirname:', __dirname);
// console.log('- process.cwd():', process.cwd());

describe('getServiceNames', function () {
  let result;

  async function testGetSesrviceNames(args = [], expected) {
    const { stdout, stderr } = await execFile(resolve(__dirname, '../js/getServiceNames.js'),
      args,
      {
        cwd: resolve(__dirname, 'fixtures/project-a'),
        env: {
          ...process.env,
          COMPOSE_FILE: 'dc.01.yml'
        }
      }
    );
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    assert.deepEqual(stdout.trim().split(' ').filter(n => n.length).sort(), expected.sort());
  }

  it('get all service names', async () => {
    await testGetSesrviceNames([], [
      'back-a',
      'back-b',
      'back-c',
      'ext-a',
      'front-a',
      'front-b',
    ]);
  });

  it('get front service names', async () => {
    await testGetSesrviceNames(['--front'], [
      'front-a',
      'front-b'
    ]);
  });

  it('get testable service names', async () => {
    await testGetSesrviceNames(['--testable'], [
      'back-a',
      'back-b',
    ]);
  });

  it('get watchable service names', async () => {
    await testGetSesrviceNames(['--watchable'], [
      'back-a',
      'back-c',
      'front-a'
    ]);
  });

  describe('get test and dependent service names for:', function () {

    it('cargo-base', async () => {
      await testGetSesrviceNames(['--test', 'back-a'], [
        'test-back-a',
        'test-back-a-store',
      ]);
    });

  });

});
