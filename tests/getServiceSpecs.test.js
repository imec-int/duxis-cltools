'use strict';

const { resolve } = require('path');

const chai = require('chai');

const { getServiceSpecs } = require('../js/utils');

describe('getServiceSpecs', function () {
  const assert = chai.assert;
  const projectDir = resolve(__dirname, 'fixtures/project-a');

  it('get specs from default compose file', async () => {
    const composeFile = resolve(projectDir, 'dc.prod.yml');
    const result = await getServiceSpecs(composeFile);
    assert.deepEqual(result, {
      'back-a': {
        build: { context: './images/back-a' },
        manifest: {
          service: 'back-a',
          cargoApp: true,
          cargoFrontend: false,
          watchable: true,
          unitTests: {
            enable: true,
            service: 'test-back-a',
            dependencies: ['test-store-a']
          }
        }
      },
      'back-b': {
        build: { context: './images/back-b' },
        manifest: {
          service: 'back-b',
          cargoApp: true,
          cargoFrontend: false,
          watchable: false,
          unitTests: {
            enable: true,
            service: 'test-back-b'
          }
        }
      },
      'back-c': {
        build: { context: './images/back-c' },
        manifest: {
          service: 'back-c',
          cargoApp: true,
          cargoFrontend: false,
          watchable: true,
          unitTests: {
            enable: false
          }
        }
      },
      'front-a': {
        build: { context: './images/front-a' },
        manifest: {
          service: 'front-a',
          cargoApp: false,
          cargoFrontend: true,
          watchable: true,
          unitTests: {
            enable: false
          }
        }
      },
      'front-b': {
        build: { context: './images/front-b' },
        manifest: {
          service: 'front-b',
          cargoApp: false,
          cargoFrontend: true,
          watchable: false,
          unitTests: {
            enable: false
          }
        }
      },
      'store-a': {
        build: { context: './images/store-a' },
        manifest: {
          service: 'store-a',
          cargoApp: false,
          cargoFrontend: false,
          watchable: false,
          unitTests: {
            enable: false
          }
        }
      },
      'ext-a': {
        image: 'postgres:9-alpine'
      }
    })
  });

});
