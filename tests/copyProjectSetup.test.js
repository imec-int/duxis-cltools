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
    else if (stdout) {
      // print whatever was logged in copyProjectSetup:
      console.log(stdout);
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

  const checkSetupContent = async (imageDir) => {
    assert.isTrue(await isDirectory(imageDir));
    const setupDir = resolve(imageDir, '__project_setup__');
    assert.isTrue(await isDirectory(setupDir));
    let file;

    // check: config.js
    file = resolve(setupDir, 'config.js');
    assert.isTrue(await exists(file));
    const copyContent = await readFile(file);
    assert.deepEqual(copyContent, configContent);

    // check: config.local.js
    file = resolve(setupDir, 'config.local.js');
    assert.isFalse(await exists(file));
  };

  it('remove copies', removeCopies);

  it('copy setup', async () => {
    await copyProjectSetup();
    const dxServices = ['back-a', 'back-b', 'back-c', 'front-a', 'front-b'];
    const otherServices = ['store-a'];
    await asyncForEach(dxServices, async (serviceName) => {
      await checkSetupContent(resolve(imagesDir, serviceName));
    });
    await asyncForEach(otherServices, async (serviceName) => {
      const setupDir = resolve(imagesDir, serviceName, '__project_setup__');
      assert.isFalse(await exists(setupDir));
    });
  });

  it('remove copies', removeCopies);

  it('copy setup for some services', async () => {
    const services = ['back-a', 'front-a'];
    await copyProjectSetup(services);
    await asyncMap(readDir(imagesDir), async (fileName) => {
      if (services.includes(fileName)) {
        await checkSetupContent(resolve(imagesDir, fileName));
      }
      else {
        const setupDir = resolve(imagesDir, fileName, '__project_setup__');
        assert.isFalse(await exists(setupDir));
      }
    });
  });

  it('remove copies', removeCopies);

});
