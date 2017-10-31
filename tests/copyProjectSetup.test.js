'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { asyncForEach, asyncMap, execFile, exists, isDirectory, readDir, readFile } = require('../js/utils');

describe('copyProjectSetup', function () {
  const assert = chai.assert;
  const copyProjectSetupPath = resolve(__dirname, '../js/copyProjectSetup.js');
  const projectDir = resolve(__dirname, '../tests/fixtures/project-a');
  const imagesDir = resolve(projectDir, 'images');
  let configContent;

  before(async () => {
    configContent = await readFile(resolve(projectDir, 'setup/config.js'));
  });

  const copyProjectSetup = async (args = []) => {
    const { stdout, stderr } = await execFile(copyProjectSetupPath, args, {
      cwd: projectDir,
      env: { ...process.env, COMPOSE_FILE: 'dc.prod.yml' }
    });
    if (stderr) {
      console.error('  - stdout:', stdout);
      throw new Error(stderr);
    }
    return stdout;
  };

  const removeCopies = async () => {
    await copyProjectSetup(['--clean']);
    await asyncMap(readDir(imagesDir), async (file) => {
      const setupDir = resolve(imagesDir, file, '__project_setup__');
      assert.isFalse(await exists(setupDir));
    });
  };

  it('copy setup', async () => {
    await copyProjectSetup();
    const services = ['back-a', 'back-b', 'back-c', 'front-a', 'front-b'];
    await asyncForEach(services, async (file) => {
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
    const services = ['back-a', 'front-a'];
    await copyProjectSetup(services);
    await asyncMap(readDir(imagesDir), async (file) => {
      const imageDir = resolve(imagesDir, file);
      assert.isTrue(await isDirectory(imageDir));
      const setupDir = resolve(imageDir, '__project_setup__');
      if (services.includes(file)) {
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
