'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { execFile } = require('../js/utils');

describe('watchable', function () {
  const assert = chai.assert;
  const watchablePath = resolve(__dirname, '../js/watchable.js');
  const projectDir = resolve(__dirname, 'fixtures/project-a');

  async function watchable(args = [], dcFile, expected) {
    const { stdout, stderr } = await execFile(watchablePath, args, {
      cwd: projectDir,
      env: {
        ...process.env,
        COMPOSE_FILE: dcFile
      }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    assert.equal(JSON.parse(stdout), expected, `watchable ${args.join(' ')} should be ${expected}, got ${stdout}.`);
  }

  it('check services in dc.prod.yml', async () => {
    const dcFile = 'dc.prod.yml';
    await watchable(['back-a'], dcFile, 1);
    await watchable(['back-b'], dcFile, 0);
    await watchable(['back-c'], dcFile, 1);
    await watchable(['front-a'], dcFile, 2);
    await watchable(['watch-b'], dcFile, 0);
    await watchable(['store-a'], dcFile, 0);
    await watchable(['ext-a'], dcFile, 0);
    await watchable(['unknown'], dcFile, 0);
  });

});
