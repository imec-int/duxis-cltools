'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { execFile } = require('../js/utils');

describe('getNetworkNames', function () {
  const assert = chai.assert;
  const getNetworkNamesPath = resolve(__dirname, '../js/getNetworkNames.js');
  const projectDir = resolve(__dirname, 'fixtures/project-a');

  async function getNetworkNames(args = [], dcFile, expected) {
    const { stdout, stderr } = await execFile(getNetworkNamesPath, args, {
      cwd: projectDir,
      env: {
        ...process.env,
        COMPOSE_FILE: dcFile,
        COMPOSE_PROJECT_NAME: 'dctools'
      }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    assert.deepEqual(stdout.trim().split(' ').filter(n => n.length).sort(), expected.sort());
  }

  it('get network names from COMPOSE_FILE = dc.prod.yml', async () => {
    await getNetworkNames([], 'dc.prod.yml', [
      'network-a',
      'network-b'
    ]);
  });

  it('get network names from --composefile = dc.prod.yml', async () => {
    await getNetworkNames(['--composefile', 'dc.prod.yml'], undefined, [
      'network-a',
      'network-b'
    ]);
  });

  it('get network names from --composefile = dc.test.yml', async () => {
    await getNetworkNames(['--composefile', 'dc.test.yml'], undefined, [
      'default'
    ]);
  });

  it('get prepended network names from COMPOSE_FILE = dc.prod.yml', async () => {
    await getNetworkNames(['--prepend'], 'dc.prod.yml', [
      'dctools_network-a',
      'dctools_network-b'
    ]);
  });

});
