# duxis-cltools - Changelog

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
