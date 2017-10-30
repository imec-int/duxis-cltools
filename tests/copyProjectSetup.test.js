'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { asyncMap, execFile, exists, isDirectory, readDir, readFile } = require('../js/utils');

const assert = chai.assert;

describe('copyProjectSetup', function () {
  const copyProjectSetup = resolve(__dirname, '../js/copyProjectSetup.js');
  const projectDir = resolve(__dirname, '../tests/fixtures/project-a');
  const imagesDir = resolve(projectDir, 'images');

  const removeCopies = async () => {
    const { stdout, stderr } = await execFile(copyProjectSetup, ['--clean'], {
      cwd: projectDir,
      env: { ...process.env, COMPOSE_FILE: 'dc.01.yml' }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }

    await asyncMap(readDir(imagesDir), async (file) => {
      const setupDir = resolve(imagesDir, file, '__project_setup__');
      assert.isFalse(await exists(setupDir));
    });
  };

  it('copy setup', async () => {
    const { stdout, stderr } = await execFile(copyProjectSetup, [], {
      cwd: projectDir,
      env: { ...process.env, COMPOSE_FILE: 'dc.01.yml' }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }

    const configContent = await readFile(resolve(projectDir, 'setup/config.js'));
    await asyncMap(readDir(imagesDir), async (file) => {
      const imageDir = resolve(imagesDir, file);
      assert.isTrue(await isDirectory(imageDir));
      const setupDir = resolve(imageDir, '__project_setup__');
      assert.isTrue(await isDirectory(setupDir));
      const configFile = resolve(setupDir, 'config.js');
      const copyContent = await readFile(configFile);
      assert.deepEqual(copyContent, configContent);
    });
  });

  it('remove copies', removeCopies);

  it('copy setup for some services', async () => {
    const serviceNames = ['back-a', 'front-a'];
    const { stdout, stderr } = await execFile(copyProjectSetup, serviceNames, {
      cwd: resolve(__dirname, '..', projectDir),
      env: { ...process.env, COMPOSE_FILE: 'dc.01.yml' }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    // console.error('  - stdout:', stdout);

    const configContent = await readFile(resolve(projectDir, 'setup/config.js'));
    await asyncMap(readDir(imagesDir), async (file) => {
      const imageDir = resolve(imagesDir, file);
      assert.isTrue(await isDirectory(imageDir));
      const setupDir = resolve(imageDir, '__project_setup__');
      if (serviceNames.includes(file)) {
        assert.isTrue(await isDirectory(setupDir));
        const configFile = resolve(setupDir, 'config.js');
        const copyContent = await readFile(configFile);
        assert.deepEqual(copyContent, configContent);
      }
      else {
        assert.isFalse(await exists(setupDir));
      }
    });
  });

  it('remove copies', removeCopies);

});
