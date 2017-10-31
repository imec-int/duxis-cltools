'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { execFile } = require('../js/utils');

describe('getTestVolumeNames', function () {
  const assert = chai.assert;
  const getTestVolumeNamesPath = resolve(__dirname, '../js/getTestVolumeNames.js');
  const projectDir = resolve(__dirname, 'fixtures/project-a');

  async function getTestVolumeNames(args = [], dcFile, expected) {
    const { stdout, stderr } = await execFile(getTestVolumeNamesPath, args, {
      cwd: projectDir,
      env: {
        ...process.env,
        COMPOSE_FILE: dcFile,
        DX_VOLUMES: 'volumes'
      }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    // console.error('  - stdout:', stdout);
    assert.deepEqual(stdout.trim().split(' ').filter(n => n.length).sort(), expected.sort());
  }

  it('get test-volume names', async () => {
    await getTestVolumeNames([], 'dc.prod.yml', ['test-store-a']);
  });

});
