# duxis-cltools

Duxis project command line development tools.

See also:

- [Changelog](CHANGELOG.md)



## Using the _cltools_ in your Duxis Project

Add the _duxis-cltools_ as a dependency in the `package.json` file in your Duxis project:

```json
{
  "name": "my-duxis-project",
  "version": "0.1.0",
  "dx_version": "1.7.2",
  "dependencies": {
    "@imec-apt/duxis-cltools": "0.7.1"
  }
}
```

Cd in your Duxis project root and learn more about the `dx` commands with:

```bash
./dx help
```



## Installing Auto-Completion

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
npm run test:watch
```



## Local Development

To test your local version of cltools in a Duxis project, cd into the project's root directory and
execute:

```bash
rm -f dx
ln -s <path-to-duxis-cltools>/dx.sh dx
```

To restore the project, execute:

```bash
rm -f dx
npm install
```



## Manual

The _duxis-cltools_ provides the command line utility `dx`, which facilitates the development, testing and deployment of _Duxis_ projects.

To develop, test or deploy a Duxis project, you first need to build the project with the `dx build` command.
You can build in one of the four following modes.
The _DX\_ENV_ columns shows the value for the `DX_ENV` environment variable in 

| Command | Mode | DX_ENV | Description |
| ------- |:----:|:------:| ----------- |
| `./dx build` | Production | `prod` | The default mode for deployment. |
| `./dx build --test` | Test | `test` | To be used for running the tests. |
| `./dx build --dev` | Development | `dev` | The standard development mode. |
| `./dx build --dxdev` | Duxis-development | `dxdev` | To be used when co-developing Duxis Foundation. <sup>(1)</sup> |

<small><ol><li>Note that to use the _Duxis-development_ mode, the `DXF_PATH` environment variable in your `.env` file should be properly configured.</li></ol></small>

Once you've built in one of these modes, you can use the other commands, depending on the mode, as shown in the following table:

| Command | prod | test | dev | dxdev | Description |
| ------- |:---:|:---:|:---:|:---:| ----------- |
| `./dx up` |X||X|X| Start the services. |
| `./dx test` ||X||| Run the tests. |
| `./dx inspect` |X||X|X| Inspect a service. |
| `./dx logs` |X|||| Print the logs. |
| `./dx stop` |X||X|X| Stop the services. |
| `./dx down` |X||X|X| Stops containers and removes containers, networks, volumes and images created when running `./dx up` (or `./dx test`). |
| `./dx restart` |X||X|X| Stop and restart the services. |
| `./dx clean` |X|X|X|X| Remove all images, containers, etc. |
| `./dx clean --test` ||X||| Remove only test images, test containers, test volumes, etc. |

You can also use certain commands on one (or several) services, as shown in the following examples:

| Command | Description |
| ------- | ----------- |
| `./dx build foo` | Build the service _foo_ in prodution mode. <sup>(1)</sup> |
| `./dx build foo bar` | Build the services _foo_ and _bar_ in prodution mode. <sup>(1)</sup> |
| `./dx build --dev foo` | Build the service _foo_ in development mode. <sup>(1)</sup> |
| `./dx up foo bar` | Start the services _foo_ and _bar_. |
| `./dx restart foo bar` | Start the services _foo_ and _bar_. |
| `./dx logs foo` | Print the logs for the service _foo_. |
| `./dx stop foo bar` | Stop the services _foo_ and _bar_. |

<small><ol><li>Individual services should be built in the same mode as the last project build.</li></ol></small>

Some commands can only be used on a single service:

| Command | Description |
| ------- | ----------- |
| `./dx inspect foo` | Inspect the service _foo_ (after it has been started). |
| `./dx watch foo` | Start the service _foo_ in _watch-mode_. |
| `./dx test --watch foo` | Test the _foo_ service in _watch-mode_. |



## Duxis Project Requirements

> This section is under construction...

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

The following table shows the values for the `NODE_ENV` and `DX_ENV` environment variables for each of the standard Duxis project modes.

| Mode | NODE_ENV | DX_ENV |
| ---- |:--------:|:------:|
| Production | `prod` |
| Test | `test` |
| Development | `dev` |
| Duxis-Development | `dxdev` |




[Docker Compose]: https://docs.docker.com/compose/
[Mocha]: https://mochajs.org
