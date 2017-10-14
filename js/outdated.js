#!/usr/bin/env node --harmony

const { resolve } = require('path');

const npmCheck = require('npm-check');

const { asyncForEach, isDirectory, readDir, readJson } = require('./utils/utils');

const ignoreDirectories = {
  '.cache': true,
  '.git': true,
  '.idea': true,
  '_volumes': true,
  'node_modules': true
};

async function walkRec(dir) {
  const names = await readDir(resolve(dir));
  if (names.includes('package.json')) {
    const path = resolve(dir, 'package.json');
    const json = await readJson(path);
    if (json.dependencies) {
      const state = await npmCheck({ cwd: dir });
      const packages = state
        .get('packages')
        .filter(({ bump, packageWanted }) => bump && packageWanted)
        .sort((pa, pb) => {
          const { devDependency: da, moduleName: na } = pa;
          const { devDependency: db, moduleName: nb } = pb;
          if (da === db) { return +(na > nb) || +(na === nb) - 1; }
          else if (da && !db) { return -1; }
          else { return 1; }
        });
      if (packages.length) {
        console.log(`\n# ${path}:`);
        packages.forEach((spec) => {
          const { bump, devDependency, homepage, latest, moduleName, packageWanted } = spec;
          const devType = devDependency ? 'D' : 'P';
          //const url = `https://www.npmjs.com/package/${moduleName}`;
          console.log(`- (${devType}) ${moduleName} - ${packageWanted} >> ${latest} - ${homepage}`);
        });
      }
      return;
    }
  }
  await asyncForEach(readDir(dir), async (name) => {
    const subdir = resolve(dir, name);
    if ((await isDirectory(subdir)) && !ignoreDirectories[name]) {
      await walkRec(subdir);
    }
  });
}

// -- CLI --------------- --- --  -

const path = resolve(process.argv[2] || '../');
console.log(`Checking for outdated dependencies in ${path} ...`);
walkRec(path)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
