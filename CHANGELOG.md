# duxis-cltools - Changelog

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
