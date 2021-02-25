---
title: Build your own IDE
---


# 构建你的IDE

本指南将教你如何构建自己的Theia应用程序。

## 要求

先决条件的详细列表位于主要的Theia代码库中：
- [Prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites)

## 设置

首先创建一个新的空目录并进入其中：

    mkdir my-app
    cd my-app

在目录下创建 `package.json`：

```json
{
  "private": true,
  "dependencies": {
    "@theia/callhierarchy": "next",
    "@theia/file-search": "next",
    "@theia/git": "next",
    "@theia/markers": "next",
    "@theia/messages": "next",
    "@theia/mini-browser": "next",
    "@theia/navigator": "next",
    "@theia/outline-view": "next",
    "@theia/plugin-ext-vscode": "next",
    "@theia/preferences": "next",
    "@theia/preview": "next",
    "@theia/search-in-workspace": "next",
    "@theia/terminal": "next"
  },
  "devDependencies": {
    "@theia/cli": "next"
  }
}
```

简而言之，Theia应用程序和扩展包都是[Node.js packages](https://nodesource.com/blog/the-basics-of-package-json-in-node-js-and-npm/)。每个软件包都有一个package.json文件，该文件可显示软件包元数据，例如名称，版本，其运行时和构建时间依赖性等。如 `name`，`version`，其运行时间和构建时间依赖性等。

让我们看一下创建的 package：
  - 因为我们不会将其用作依赖项，所以省略了它的`name`和`version`，并且由于它不会单独作为Node.js包发布，因此将其标记为`private`。
  - 我们已将所需的扩展列为运行时依赖项，例如 `@theia/navigator`。
    - 某些扩展程序需要安装其他工具，例如 [@theia/python](https://www.npmjs.com/package/@theia/python) 需要安装[Python 语言服务](https://github.com/palantir/python-language-server)。在这种情况下，请查阅相应的扩展文档。
    - 点击[此链接](https://www.npmjs.com/search?q=keywords:theia-extension)查看所有已发布的扩展。
  - 我们将 [@theia/cli](https://www.npmjs.com/package/@theia/cli) 列为构建时依赖项。它提供了用于构建和运行应用程序的脚本。

## 使用VS code扩展

作为应用程序的一部分，也可以使用（和打包）VS Code扩展。[Theia 代码库](https://github.com/eclipse-theia/theia/wiki/Consuming-Builtin-and-External-VS-Code-Extensions)包含有关如何将此类扩展包含在应用程序的`package.json`中的指南。

一个示例 `package.json` 可能如下所示：

```json
{
  "private": true,
  "dependencies": {
    "@theia/callhierarchy": "next",
    "@theia/file-search": "next",
    "@theia/git": "next",
    "@theia/markers": "next",
    "@theia/messages": "next",
    "@theia/mini-browser": "next",
    "@theia/navigator": "next",
    "@theia/outline-view": "next",
    "@theia/plugin-ext-vscode": "next",
    "@theia/preferences": "next",
    "@theia/preview": "next",
    "@theia/search-in-workspace": "next",
    "@theia/terminal": "next"
  },
  "devDependencies": {
    "@theia/cli": "next"
  },
  "scripts": {
    "prepare": "yarn run clean && yarn build && yarn run download:plugins",
    "clean": "theia clean",
    "build": "theia build --mode development",
    "start": "theia start --plugins=local-dir:plugins",
    "download:plugins": "theia download:plugins"
  },
  "theiaPluginsDir": "plugins",
  "theiaPlugins": {
    "vscode-builtin-css": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/css-1.39.1-prel.vsix",
    "vscode-builtin-html": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/html-1.39.1-prel.vsix",
    "vscode-builtin-javascript": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/javascript-1.39.1-prel.vsix",
    "vscode-builtin-json": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/json-1.39.1-prel.vsix",
    "vscode-builtin-markdown": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/markdown-1.39.1-prel.vsix",
    "vscode-builtin-npm": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/npm-1.39.1-prel.vsix",
    "vscode-builtin-scss": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/scss-1.39.1-prel.vsix",
    "vscode-builtin-typescript": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/typescript-1.39.1-prel.vsix",
    "vscode-builtin-typescript-language-features": "https://github.com/theia-ide/vscode-builtin-extensions/releases/download/v1.39.1-prel/typescript-language-features-1.39.1-prel.vsix"
  }
}
```

## 构建

首先，安装所有依赖项。

    yarn

其次，使用Theia CLI构建应用程序。

    yarn theia build

`yarn` 在我们的应用程序上下文中查找 `@theia/cli` 提供的 `theia` 可执行文件，然后使用 `theia` 执行  `build` 命令。
由于应用程序默认情况下是在生产模式下构建的（即经过混淆和缩小），因此可能需要一段时间。

## 运行

构建完成后，我们可以启动应用程序：

    yarn start

你可以提供一个 `workspace` 路径作为第一个参数打开，并提供 `--hostname` 和 `--port` 选项以将应用程序部署在特定的网络接口和端口上，例如在所有接口和端口 `8080` 上打开 `/workspace`：

    yarn start /my-workspace --hostname 0.0.0.0 --port 8080

在终端中，你应该看到Theia应用程序已启动并正在侦听：

<img class="doc-image" src="/docs-terminal.png" alt="Terminal" style="max-width: 750px">

通过在新的浏览器页面中输入打印的地址来打开应用程序。

## 故障排除

### 找不到插件

如果正在运行的Theia实例中没有可用的插件，则可能是您需要告诉Theia在哪里可以找到下载的插件。上面的示例在 `start` 命令中设置了 `--plugins` 开关，这应该足够了。但是，如果直接运行 `theia start`则可以选择设置环境变量来实现相同的目的：

    export THEIA_DEFAULT_PLUGINS=local-dir:plugins

### 在代理后构建本机依赖

如果在代理后面运行 `yarn` 命令，则在构建的本机依赖项（例如 `oniguruma` ）中可能会在构建的最后部分遇到问题，并带有以下错误堆栈：

    [4/4] Building fresh packages...
    [1/9]  XXXXX
    [2/9]  XXXXX
    [3/9]  XXXXX
    [4/9]  XXXXX
    error /theiaide/node_modules/XXXXX: Command failed.
    Exit code: 1
    Command: node-gyp rebuild
    Arguments:
    Directory: /theiaide/node_modules/XXXXX
    Output:
    gyp info it worked if it ends with ok
    gyp info using node-gyp@3.8.0
    gyp info using node@8.15.0 | linux | x64
    gyp http GET https://nodejs.org/download/release/v8.15.0/node-v8.15.0-headers.tar.gz
    gyp WARN install got an error, rolling back install
    gyp ERR! configure error
    gyp ERR! stack Error: read ECONNRESET
    gyp ERR! stack at TLSWrap.onread (net.js:622:25)
    gyp ERR! System Linux 3.10.0-862.11.6.el7.x86_64
    gyp ERR! command "/usr/bin/node" "/usr/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
    gyp ERR! cwd /theiaide/node_modules/XXXXX
    gyp ERR! node -v v8.15.0

发生这种情况是因为node-gyp不依赖 system/NPM 代理设置。在这种情况下，请使用错误堆栈中提供的链接下载  `node-headers` 文件（如上所示：https://nodejs.org/download/release/v8.15.0/node-v8.15.0-headers.tar.gz ），并使用以下命令运行构建：

     npm_config_tarball=/path/to/node-v8.15.0-headers.tar.gz yarn install

