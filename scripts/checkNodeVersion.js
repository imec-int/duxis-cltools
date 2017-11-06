#!/usr/bin/env node --harmony

'use strict';

const process = require('process');

const chalk = require('chalk');
const semver = require('semver');

const projectPackage = require('../package.json');

const { log } = console;

async function checkNodeVersion() {
  if (!semver.satisfies(process.version, projectPackage.engines.node)) {
    log(chalk.red(`Please update Node.js to version ${projectPackage.engines.node}.`));
  }
}

// -- CLI --------------- --- --  -

checkNodeVersion()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
