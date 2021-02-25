---
title: Authoring an Extension
---

#  开发 Theia 扩展

例如，我们将添加一个菜单项 _Say hello_ 来显示通知“ Hello world！”。本文指导你完成所有必要的步骤。

## Theia 架构

Theia应用程序由 _extensions_（扩展包）组成。扩展包为特定功能提供了一组小部件，命令，处理程序等。Theia本身提供了许多扩展程序，例如适用于编辑器，终端，项目视图等。每个扩展都是一个单独的npm包。

Theia定义了大量的 contribution（可扩展）的接口，这些接口允许扩展包将其行为添加到应用程序的各个方面。只需搜索名称为*  `*Contribution` 的接口就可以体会到。一个扩展包需要在 contribution 接口上实现自己的特定功能。在此示例中，我们将实现 `CommandContribution` 和 `MenuContribution`。扩展包与Theia应用程序进行交互的其他方式是通过各种 _services_ 或 _managers_。

在Theia，一切都通过[依赖注入](Services_and_Contributions.md#dependency-injection-di)来实现。扩展定义了一个或多个依赖注入模块。这是它将 contribution implementations 绑定到相应 contribution interface 的地方。这些模块在扩展软件包的 `package.json` 中列出。扩展包可以为 frontend 做出contribute，例如提供UI扩展以及 backend，例如提供语言服务器。当应用程序启动时，所有这些模块的并集用于在frontend和backend的每个模块上配置单个全局依赖项注入容器。然后，运行时将通过多次注入收集特定种类的所有 contributions。

## 先决条件

先决条件信息可从[Theia 代码库](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites)获取。

## 项目结构

我们将创建一个名为 `theia-hello-world-extension` 的monorepo（包含多个npm软件包的存储库），其中包含三个软件包：`hello-world-extension`，`browser-app` 和 `electron-app`。前一个包含我们的扩展程序，后两个包含Theia应用程序以在 browser 和 electron 下运行我们的扩展程序。我们将使用 `yarn` 而不是 `npm`，因为它允许将这种monorepos结构化到工作区中。在我们的例子中，每个工作区都包含自己的 `npm` 包。这些软件包的公共依赖项通过 `yarn` 提升到其公共根目录。我们还将使用 `lerna` 在工作空间中运行脚本。

为了简化此类代码库的设置，我们创建了[代码生成器](https://www.npmjs.com/package/generator-theia-extension)来构建项目。它还将生成 `hello-world` 示例。如下：

```bash
npm install -g yo generator-theia-extension
mkdir theia-hello-world-extension
cd theia-hello-world-extension
yo theia-extension # select the 'Hello World' option and complete the prompts
```

现在让我们看一下生成的代码。根目录下的 `package.json` 定义了workspaces、对 `lerna` 的依赖关系以及一些用于rebuild browser 或 electron 的本机软件包的脚本。

```json
{
  "private": true,
  "scripts": {
    "prepare": "lerna run prepare",
    "rebuild:browser": "theia rebuild:browser",
    "rebuild:electron": "theia rebuild:electron"
  },
  "devDependencies": {
    "lerna": "2.4.0"
  },
  "workspaces": [
    "hello-world-extension", "browser-app", "electron-app"
  ]
}
```

我们还有一个 `lerna.json` 文件来配置 `lerna`：

```json
{
  "lerna": "2.4.0",
  "version": "0.1.0",
  "useWorkspaces": true,
  "npmClient": "yarn",
  "command": {
    "run": {
      "stream": true
    }
  }
}
```

## 实现扩展包

接下来，让我们在 `hello-world-extension` 文件夹中查看生成的代码。我们可以从 `package.json` 开始。 它指定了程序包的元数据，`dependencies` 对 `@theia/core` 的依赖，`scripts`和 `devDependencies` 以及 `theiaExtensions`。

keywords 中的 `theia-extension` 很重要，它指定了Theia应用程序从 `npm` 识别并安装Theia扩展。

```json
{
  "name": "hello-world-extension",
  "keywords": [
    "theia-extension"
  ],
  "version": "0.1.0",
  "files": [
    "lib",
    "src"
  ],
  "dependencies": {
    "@theia/core": "latest"
  },
  "devDependencies": {
    "rimraf": "latest",
    "typescript": "latest"
  },
  "scripts": {
    "prepare": "yarn run clean && yarn run build",
    "clean": "rimraf lib",
    "build": "tsc",
    "watch": "tsc -w"
  },
  "theiaExtensions": [
    {
      "frontend": "lib/browser/hello-world-frontend-module"
    }
  ]
}
```

最后一个属性 `theiaExtensions` 是我们列出JavaScript模块的地方，这些模块导出DI模块，这些DI模块定义了扩展的 contribution 绑定。在这个例子中，我们仅提供 frontend 功能（命令和菜单项）。类似地，你也可以定义对 backend 的 contributions，例如语言服务器的语言 contributions。

在 frontend 模块中，我们导出一个默认对象，它是一个[InversifyJS `ContainerModule`](https://github.com/inversify/InversifyJS/blob/master/wiki/container_modules.md)，带有用于 command contribution 和 menu contribution 的绑定。

```typescript
export default new ContainerModule(bind => {
    // add your contribution bindings here
    bind(CommandContribution).to(HelloWorldCommandContribution);
    bind(MenuContribution).to(HelloWorldMenuContribution);
});
```

command 是定义ID和标签的纯数据结构。通过在 command contribution 中将处理程序注册为其ID来实现 command 的行为。生成器已经添加了显示"Hello World!"信息的命令和处理程序。

```typescript
export const HelloWorldCommand = {
    id: 'HelloWorld.command',
    label: "Shows a message"
};

@injectable()
export class HelloWorldCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(HelloWorldCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}
...
```

注意我们如何在构造函数中使用 `@inject` 来获取 `MessageService` 作为属性，以及稍后在处理程序实现中如何使用它。这就是依赖注入的优雅之处：作为消费方，我们既不在乎这些依赖来自何处，也不在乎其生命周期是什么。

为了使它可以通过UI进行访问，我们实现了 `MenuContribution`，在菜单栏中的编辑菜单的“搜索/替换”部分添加了一个项目。

```typescript
...
@injectable()
export class HelloWorldMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
                commandId: HelloWorldCommand.id,
                label: 'Say Hello'
            });
    }
}
```

## 在浏览器中执行扩展

现在我们来看如何将扩展包在项目中跑起来。我们在`browser-app` 文件下生成了 `package.json` 文件。它定义了一个Theia浏览器应用程序，其中包含了一些扩展，包括我们的 `hello-world-extension`。如 `scripts` 部分中所定义，此目录中的所有剩余文件都是通过 `yarn` 在构建过程中调用 `theia-cli` 工具自动生成。

```json
{
  "name": "browser-app",
  "version": "0.1.0",
  "dependencies": {
    "@theia/core": "latest",
    "@theia/filesystem": "latest",
    "@theia/workspace": "latest",
    "@theia/preferences": "latest",
    "@theia/navigator": "latest",
    "@theia/process": "latest",
    "@theia/terminal": "latest",
    "@theia/editor": "latest",
    "@theia/languages": "latest",
    "@theia/markers": "latest",
    "@theia/monaco": "latest",
    "@theia/messages": "latest",
    "hello-world-extension": "0.1.0"
  },
  "devDependencies": {
    "@theia/cli": "latest"
  },
  "scripts": {
    "prepare": "theia build",
    "start": "theia start",
    "watch": "theia build --watch"
  },
  "theia": {
    "target": "browser"
  }
}
```

现在，我们将所有部分组装在一起，以构建和运行该应用程序。要运行 browser 应用程序，请输入：

```bash
cd browser-app
yarn start <path to workspace>
```

在浏览器中打开 http://localhost:3000。然后从菜单中选择 _Edit > Say Hello_，就会弹出 "Hello World!"。

## 在 Electron 中执行扩展

Electron应用程序的 `package.json` 看起来几乎相同，除了name和target属性。

```json
{
  "name": "electron-app",
  ...
  "theia": {
    "target": "electron"
  }
}
```

在运行Electron应用程序之前，你还必须重新构建本地模块：

```bash
yarn rebuild:electron
cd electron-app
yarn start <path to workspace>
```

## 部署扩展

如果你想公开扩展包，我们建议将其发布到npm。这可以通过调用扩展包目录中的 `yarn publish` 来实现。当然，你需要一个有效的帐户。
