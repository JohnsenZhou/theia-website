---
title: Services and Contributions
---

# Services and Contributions

在本节中，我们描述扩展如何使用其他扩展的服务，以及它们如何对Theia工作台进行改动。

## 依赖注入 (DI)

Theia 用 DI 框架 [Inversify.js](http://inversify.io/) 来连接不同的组件。

DI将组件从创建其依赖关系中分离出来。相反，它将在创建时注入它们（作为构造函数的参数）。DI容器会根据你在启动时通过所谓的容器模块提供的一些配置为你进行创建。

例如 `Navigator` 组件需要访问 `FileSystem` 才能在树形结构中显示文件夹和文件。在DI中，`FileSystem` 接口的实现对于 `Navigator` 并不重要，它可以大胆地假设与 `FileSystem` 接口一致的对象已经准备好并可以使用了。在 Theia 中，`FileSystem` 的实现仅仅是一个发送 JSON-RPC 消息到后端的代理，它需要一个特殊的配置和处理程序。`Navigator` 不需要关心这些细节，因为它将获取一个被注入的 `FileSystem` 的实例。

此外，这种结构的解耦和使用，允许扩展包在需要时能提供非常具体的功能实现，例如这里提到的 `FileSystem`，而不需要接触到 `FileSystem` 接口的任何实现。

DI是Theia不可或缺的一部分。因此强烈建议先学习[Inversify.js](http://inversify.io/)的基础知识。

## Services

Service 只是一个提供给其它组件使用的绑定。一个扩展包可以暴露 `SelectionService`，这样其它扩展包就可以获得一个注入的实例并使用它。

## Contribution-Points

如果一个扩展包想要提供 hook 来给其它扩展包用，那么它应该定义一个 _contribution-point_。一个 _contribution-point_ 就是一个可以被其它扩展包实现的接口。扩展包可以在需要时将它委托给其它部分。


例如，`OpenerService` 定义了一个 contribution-point 允许其它扩展包注册 `OpenHandler`，你可以查看  [这里](https://github.com/eclipse-theia/theia/blob/master/packages/core/src/browser/opener-service.ts) 的代码。

Theia 已经提供了大量的 Contribution Points 列表，查看已存在的 Contribution Points 的一个好方法是查找 `bindContributionProvider` 的引用。

## Contribution Providers

一个 contribution provider 基本上是 contributions 的容器，其中 contributions 是绑定类型的实例。

你可以这样将一个类型绑定到 contribution provider：

``` typescript
// messaging-module.ts
export const messagingModule = new ContainerModule(bind => {
    bind<BackendApplicationContribution>(BackendApplicationContribution).to(MessagingContribution);
    bindContributionProvider(bind, ConnectionHandler)
});
```

最后一行将一个 ContributionProvider 绑定到一个包含所有 ConnectionHandler 绑定实例的对象上。

像这样使用：

``` typescript
// messaging-module.ts
    constructor( @inject(ContributionProvider) @named(ConnectionHandler) protected readonly handlers: ContributionProvider<ConnectionHandler>) {
    }

```

这里我们注入了一个 ContributionProvider，它的 name 值是 ConnectionHandler，这个值之前是由 `bindContributionProvider` 绑定的。

这使得任何人都可以绑定 ConnectionHandler，现在，当 messageingModule启动时，所有的 ConnectionHandlers 都将被初始化。
