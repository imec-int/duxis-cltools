#!/usr/bin/env node --harmony

const getServiceSpecs = require('./utils/getServiceSpecs');

/**
 * @param {string} name - The name of a name.
 * @returns {Promise.<int>}
 */
const watchable = async (name) => {
  if (!name) {
    throw new Error('Missing service name parameter.');
  }

  const serviceSpecs = await getServiceSpecs();
  const serviceSpec = serviceSpecs[name];

  let result = 0;
  if (serviceSpec.manifest && serviceSpec.manifest.watchable) {
    if (serviceSpec.manifest.cargoApp) {
      result += 1;
    }
    if (serviceSpec.manifest.cargoFrontend) {
      result += 2;
    }
  }
  console.log(result);
};

// -- CLI --------------- --- --  -

watchable(process.argv[2])
  .catch((error) => {
    console.error(error.stack);
    process.exit(1);
  });
