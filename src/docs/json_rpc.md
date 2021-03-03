---
title: Communication via JSON-RPC
---

# 通过JSON-RPC进行通信

在本节中我们将介绍如何创建后端服务，然后通过JSON-RPC对它进行连接。

我将使用调试日志记录系统作为其中的一个小示例。

## 概述

其中大致的工作原理是创建一个基于express框架的服务，再通过websocket进行连接。

## 注册服务

因此，要做的第一件事就是暴露你的服务，以便前端可以连接到它。

你将需要创建与此类似的后端服务器模块文件 (logger-server-module.ts):

``` typescript

import { ContainerModule } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from "../../messaging/common";
import { ILoggerServer, ILoggerClient } from '../../application/common/logger-protocol';

export const loggerServerModule = new ContainerModule(bind => {
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<ILoggerClient>("/services/logger", client => {
            const loggerServer = ctx.container.get<ILoggerServer>(ILoggerServer);
            loggerServer.setClient(client);
            return loggerServer;
        })
    ).inSingletonScope()
});
```

让我们详细介绍一下：

``` typescript
import { ConnectionHandler, JsonRpcConnectionHandler } from "../../messaging/common";
```

这里引入了 `JsonRpcConnectionHandler`，它能创建一个连接处理函数，函数中的 onConnection 会为通过JSON-RPC在 backend 中调用的对象创建代理对象，并将本地对象公开给JSON-RPC。下面分析一下具体是怎么做到的。

`ConnectionHandler` 是一个简单的接口，仅仅指定了连接的 path（路径）和 建立连接时的回调 onConnection：

``` typescript
import { MessageConnection } from "vscode-jsonrpc";

export const ConnectionHandler = Symbol('ConnectionHandler');

export interface ConnectionHandler {
    readonly path: string;
    onConnection(connection: MessageConnection): void;
}
```

``` typescript
import { ILoggerServer, ILoggerClient } from '../../application/common/logger-protocol';
```

logger-protocol.ts 文件包含了 server 和 client 需要 implement 的接口。


这里的 server 表示将通过JSON-RPC调用的后端对象，client 是一个客户端对象，可以接收来自
后端的对象。

``` typescript
    bind<ConnectionHandler>(ConnectionHandler).toDynamicValue(ctx => {
```

Here a bit of magic happens, at first glance we're just saying here's an
implementation of a ConnectionHandler.

The magic here is that this ConnectionHandler type is bound to a
ContributionProvider in messaging-module.ts

So as the MessagingContribution starts (onStart is called) it creates a
websocket connection for all bound ConnectionHandlers.

如下 (messaging-module.ts):

``` typescript
constructor( @inject(ContributionProvider) @named(ConnectionHandler) protected readonly handlers: ContributionProvider<ConnectionHandler>) {
    }

    onStart(server: http.Server): void {
        for (const handler of this.handlers.getContributions()) {
            const path = handler.path;
            try {
                createServerWebSocketConnection({
                    server,
                    path
                }, connection => handler.onConnection(connection));
            } catch (error) {
                console.error(error)
            }
        }
    }
```

To dig more into ContributionProvider see this [section](Services_and_Contributions#contribution-providers).

So now:

``` typescript
new JsonRpcConnectionHandler<ILoggerClient>("/services/logger", client => {
```

This does a few things if we look at this class implementation:

``` typescript
export class JsonRpcConnectionHandler<T extends object> implements ConnectionHandler {
    constructor(
        readonly path: string,
        readonly targetFactory: (proxy: JsonRpcProxy<T>) => any
    ) { }

    onConnection(connection: MessageConnection): void {
        const factory = new JsonRpcProxyFactory<T>(this.path);
        const proxy = factory.createProxy();
        factory.target = this.targetFactory(proxy);
        factory.listen(connection);
    }
}
```

We see that a websocket connection is created on path: "logger" by the extension of the ConnectionHandler class with the path attribute set to "logger".

And let's look at what it does onConnection :

``` typescript
    onConnection(connection: MessageConnection): void {
        const factory = new JsonRpcProxyFactory<T>(this.path);
        const proxy = factory.createProxy();
        factory.target = this.targetFactory(proxy);
        factory.listen(connection);
```


Let's go over this line by line:

``` typescript
    const factory = new JsonRpcProxyFactory<T>(this.path);
```

This creates a JsonRpcProxy on path "logger".

``` typescript
    const proxy = factory.createProxy();
```

Here we create a proxy object from the factory, this will be used to call
the other end of the JSON-RPC connection using the ILoggerClient interface.

``` typescript
    factory.target = this.targetFactory(proxy);
```

This will call the function we've passed in parameter so:

``` typescript
        client => {
            const loggerServer = ctx.container.get<ILoggerServer>(ILoggerServer);
            loggerServer.setClient(client);
            return loggerServer;
        }
```

This sets the client on the loggerServer, in this case this is used to
send notifications to the frontend about a log level change.

And it returns the loggerServer as the object that will be exposed over JSON-RPC.

``` typescript
 factory.listen(connection);
```

This connects the factory to the connection.

The endpoints with `services/*` path are served by the webpack dev server, see `webpack.config.js`:

``` javascript
    '/services/*': {
        target: 'ws://localhost:3000',
        ws: true
    },
```

## Connecting to a service

So now that we have a backend service let's see how to connect to it from
the frontend.

To do that you will need something like this:

(From logger-frontend-module.ts)

``` typescript
import { ContainerModule, Container } from 'inversify';
import { WebSocketConnectionProvider } from '../../messaging/browser/connection';
import { ILogger, LoggerFactory, LoggerOptions, Logger } from '../common/logger';
import { ILoggerServer } from '../common/logger-protocol';
import { LoggerWatcher } from '../common/logger-watcher';

export const loggerFrontendModule = new ContainerModule(bind => {
    bind(ILogger).to(Logger).inSingletonScope();
    bind(LoggerWatcher).toSelf().inSingletonScope();
    bind(ILoggerServer).toDynamicValue(ctx => {
        const loggerWatcher = ctx.container.get(LoggerWatcher);
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<ILoggerServer>("/services/logger", loggerWatcher.getLoggerClient());
    }).inSingletonScope();
});
```

The important bit here are those lines:

``` typescript
    bind(ILoggerServer).toDynamicValue(ctx => {
        const loggerWatcher = ctx.container.get(LoggerWatcher);
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<ILoggerServer>("/services/logger", loggerWatcher.getLoggerClient());
    }).inSingletonScope();

```

Let's go line by line:

``` typescript
        const loggerWatcher = ctx.container.get(LoggerWatcher);
```

Here we're creating a watcher, this is used to get notified about events
from the backend by using the loggerWatcher client
(loggerWatcher.getLoggerClient())

See more information about how events work in theia [here](Events.md#events).

``` typescript
        const connection = ctx.container.get(WebSocketConnectionProvider);
```

Here we're getting the websocket connection, this will be used to create a proxy from.

``` typescript
        return connection.createProxy<ILoggerServer>("/services/logger", loggerWatcher.getLoggerClient());
```

As the second argument, we pass a local object to handle JSON-RPC messages from the remote object.
Sometimes the local object depends on the proxy and cannot be instantiated before the proxy is instantiated.
In such cases, the proxy interface should implement `JsonRpcServer` and the local object should be provided as a client.

```ts
export type JsonRpcServer<Client> = Disposable & {
    setClient(client: Client | undefined): void;
};

export interface ILoggerServer extends JsonRpcServery<ILoggerClient> {
    // ...
}

const serverProxy = connection.createProxy<ILoggerServer>("/services/logger");
const client = loggerWatcher.getLoggerClient();
serverProxy.setClient(client);
```

So here at the last line we're binding the ILoggerServer interface to a
JsonRpc proxy.

Note that his under the hood calls:

``` typescript
 createProxy<T extends object>(path: string, target?: object, options?: WebSocketOptions): T {
        const factory = new JsonRpcProxyFactory<T>(path, target);
        this.listen(factory, options);
        return factory.createProxy();
    }
```

So it's very similar to the backend example.

Maybe you've noticed too but as far as the connection is concerned the frontend
is the server and the backend is the client. But that doesn't really
matter in our logic.

So again there's multiple things going on here what this does is that:
 - it creates a JsonRpc Proxy on path "logger".
 - it exposes the loggerWatcher.getLoggerClient() object.
 - it returns a proxy of type ILoggerServer.

So now instances of ILoggerServer are proxied over JSON-RPC to the
backend's LoggerServer object.

## Loading the modules in the example backend and frontend

So now that we have these modules we need to wire them into the example.
We will use the browser example for this, note that it's the same code for
the electron example.

### Backend

In examples/browser/src/backend/main.ts you will need something like:

``` typescript
import { loggerServerModule } from 'theia-core/lib/application/node/logger-server-module';
```

And than load that into the main container:

``` typescript
container.load(loggerServerModule);
```

### Frontend

In examples/browser/src/frontend/main.ts you will need something like:

``` typescript
import { loggerFrontendModule } from 'theia-core/lib/application/browser/logger-frontend-module';
```

``` typescript
container.load(frontendLanguagesModule);
```

## Complete example

If you wish to see the complete implementation of what I referred too in
this documentation see [this commit](https://github.com/eclipse-theia/theia/commit/99d191f19bd2a3e93098470ca1bb7b320ab344a1).

