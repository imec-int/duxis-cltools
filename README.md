# duxis-cltools

Duxis project command line development tools.

## Instructions

Install the cltools globally:

```bash
npm install -g duxis-cltools
```

Or add the cltools in the dependencies of the `package.json` file in your Duxis project.

Cd in your Duxis project root and learn more about the `dx` commands with:

```bash
dx help
```



## Auto-Completion

Auto-completion for the `dx` command is or can be installed on MacOS and Linux.

For MacOS, auto-completion support assumes that you installed _bash auto-completion_ as instructed in this [how-to article](https://iminds.atlassian.net/wiki/spaces/developers/pages/83132417).

For Linux, move `tmp_bash_completion.d/dx` to `/etc/bash_completion.d/dx`:

```bash
sudo mv <path-to-package>/tmp_bash_completion.d/dx /etc/bash_completion.d/dx
```

e.g.:

```bash
sudo mv node_modules/@imec-apt/duxis-cltools/tmp_bash_completion.d/dx /etc/bash_completion.d/dx
```

Pull requests that add support for other platforms are more than welcome!



## Test the cltools

Run the tests once:

```bash
npm test
```

Or run the tests in watch-mode:

```bash
npm run test-watch
```



## Manual

The _duxis-cltools_ provides the command line utility `dx`, which facilitates the development, testing and deployment of _Duxis_ projects.

### Duxis Project Requirements

The following files and directories are required (or optional) in a Duxis project.

| Path | Purpose |
|:---- |:------- |
| `.env` | Provides default values for (most of) the environment variables. Some additional variables are set by the `dx` cli. |
| `dc.base.yml` | Optional [Docker Compose][] file that typically provides the common configation, and is extended in the environment-specific compose files. |
| `dc.dev.yml` | The [Docker Compose][] file that provides the development-specific configation. |
| `dc.dxdev.yml` | Optional [Docker Compose][] file that provides the extended Duxis-development configation. |
| `dc.prod.yml` | The [Docker Compose][] file that provides the production-specific configation. |
| `dc.test.yml` | The [Docker Compose][] file that provides the test configation. |
| ... | (TODO) |




[Docker Compose]: https://docs.docker.com/compose/
[Mocha]: https://mochajs.org
