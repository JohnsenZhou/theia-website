---
title: Events
---

## 事件机制

Theia中的事件机制可能会令人困惑，希望我们能描述清楚。

请看以下代码：

(From logger-watcher.ts)
``` typescript
@injectable()
export class LoggerWatcher {

    getLoggerClient(): ILoggerClient {
        const emitter = this.onLogLevelChangedEmitter
        return {
            onLogLevelChanged(event: ILogLevelChangedEvent) {
                emitter.fire(event)
            }
        }
    }

    private onLogLevelChangedEmitter = new Emitter<ILogLevelChangedEvent>();

    get onLogLevelChanged(): Event<ILogLevelChangedEvent> {
        return this.onLogLevelChangedEmitter.event;
    }
}
```

从这里开始看：

``` typescript
    private onLogLevelChangedEmitter = new Emitter<ILogLevelChangedEvent>();
```

首先得了解什么是 `Emitter`?

Emitter 是一个事件处理程序容器，可以在上面注册事件处理程序，并使用X类型的事件（在本例中为ILogLevelChangedEvent）触发事件处理程序。

因此，在这里我们只创建一个`Emitter`，它将具有ILogLevelChangedEvent类型的事件；

接下来，我们希望能够在此`Emitter`上注册事件处理程序：

``` typescript
    get onLogLevelChanged(): Event<ILogLevelChangedEvent> {
        return this.onLogLevelChangedEmitter.event;
    }
```

这实际上返回的是一个用于注册事件的函数处理方法，因此你只需将事件处理方法传入，注册函数就会对其进行注册，以便在事件触发时调用它。

so you can call:

(From logger.ts)
``` typescript
 /* Update the root logger log level if it changes in the backend. */
        loggerWatcher.onLogLevelChanged(event => {
            this.id.then(id => {
                if (id === this.rootLoggerId) {
                    this._logLevel = Promise.resolve(event.newLogLevel);
                }
            });
        });
```

这样就在 emitter 上注册了一个匿名函数。

接下来，我们需要通过触发一个事件来触发它：

``` typescript
 onLogLevelChanged(event: ILogLevelChangedEvent) {
                emitter.fire(event)
            }
```

调用此函数时，emitter 将触发所有该事件的处理函数。

因此，theia中的事件大致如下：

 - 创建一个 emitter
 - 通过 emitter.event 方法注册事件
 - 通过 emitter.fire(event) 触发事件
