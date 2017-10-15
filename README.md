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

Auto-completion is installed on MacOS.
It assumes that you installed bash auto-completion as instructed in this [how-to article](https://iminds.atlassian.net/wiki/spaces/developers/pages/83132417). 

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



[Mocha]: https://mochajs.org
