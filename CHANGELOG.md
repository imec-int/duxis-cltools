# duxis-cltools - Changelog

## 1.3.0
- feat: Call `az acr login` for azure registry containers

## 1.2.0
- feat: Add `build --dxtest` mode, which builds the test images using local base images.


## 1.1.0
- Also run `npm outdated` when calling `./dx outdated`.


## 1.0.2
- Assert that required environment variables are provided.


## 1.0.1
- Bug fix.


## 1.0.0
- Add support for `FROM node` declarations in _Dockerfile.template_ files with insertion of Node.js
  version declared as `nodeVersion` property in the project _package.json_ file.
- No longer expect a trailing slash for _DX\_HUB_ values.
- Use `imec` as default value for _DX\_HUB_. This new prefix should be used for Duxis Foundation
  v1.14.0 and up. For services that reference a prefixed Duxis Foundation image in the _dx.base.yml_
  Docker Composer file, e.g. `image: ${DX_HUB}/duxis-auth-store:${DX_VERSION}`, you should override
  this reference with an un-prefixed one -e.g. `image: duxis-auth-store:${DX_VERSION}`- in the
  _dc.dxdev.yml_ file.
- Upgrade to Node.js 8.11.3 LTS.


## 0.7.2
- Use `DX_HUB` value from project’s .env file when possible.
- Upgrade to Node.js 8.11.0 LTS.


## 0.7.1
- Bugfix -  `./dx watch` command doesn't work properly (DUX-135).
- Bugfix - Outdated Node.js warning is not shown.
- Upgrade dependencies.


## 0.7.0
- Do not include `*.local.*` files in setup directory in built images.


## v0.6.5
- Improve Node.js version check.
- Fix `/usr/bin/env: node --harmony: No such file or directory` error on Linux which does not support multiple arguments in shebangs.


## v0.6.4
- Upgrade to Node.js 8.9.0 LTS.
- Fix bug: `./dx test --watch <service>` yields `No such service: test-test-<service>`.
- Warn when using `./dx test --watch` without `<service>`.
- Do not fail when fixture directories such as `images`, contains `.DS_Store` or other such files.


## v0.6.3
- Do not fail when compose file has no services.


## v0.6.2
- Bugfix in experimental _build-hook_ support.


## v0.6.0
- Add experimental _build-hook_ support.
  When the environment variable `DX_BUILD_HOOK` has a value, then this value is taken as a (Bash) command that is executed when the `./dx build` command is executed.


## v0.5.0
- Add more tests and fix problematic behaviour.
- Add more documentation.


## v0.4.0
- Add the ability to copy the project setup for select services.
- Also copy the project setup for test builds.


## v0.3.0
- Added check of _Node.js_ version.
