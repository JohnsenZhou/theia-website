---
title: Commands and Keybindings
---

# Commands and Keybindings

可以通过许多不同方式扩展Theia。Commands 允许程序包提供独特的命令，然后其他程序包可以调用这些命令。也可以在这些命令中添加键绑定和上下文，以便在特定条件下（窗口焦点，当前选择等）调用它们。

## 将命令添加到Theia命令注册表

要将命令添加到命令注册表，模块必须实现 `CommandContribution` 类，即

**java-commands.ts**
```typescript
@injectable()
export class JavaCommandContribution implements CommandContribution {
...
    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(SHOW_JAVA_REFERENCES, {
            execute: (uri: string, position: Position, locations: Location[]) =>
                commands.executeCommand(SHOW_REFERENCES.id, uri, position, locations)
        });
        commands.registerCommand(APPLY_WORKSPACE_EDIT, {
            execute: (changes: WorkspaceEdit) =>
                !!this.workspace.applyEdit && this.workspace.applyEdit(changes)
        });
    }
}
```

每个命令都需要一个唯一的命令ID和一个命令处理程序。

### 将 contribution 绑定到 CommandContribution

然后将 contribution 类注入到适当的模块中（确保首先将类标记为`@injectable`），如下所示：

**java-frontend-module.ts**
```typescript
export default new ContainerModule(bind => {
    bind(CommandContribution).to(JavaCommandContribution).inSingletonScope();
    ...
});
```

负责注册和执行命令的类是命令注册表，也可以使用 `get commandIds()` api获取命令列表。

## 将键绑定添加到键绑定注册表

默认情况下，命令不需要键绑定，因为它们可以通过许多其他方式（编码，用户点击等）来调用。但是你也可以使用与 contributing commands 相似的方式将具有特定上下文的键绑定添加到命令中。

要实现键绑定，只需注入 `KeybindingContribution` 的实现。

**editor-keybinding.ts**
```typescript
@injectable()
export class EditorKeybindingContribution implements KeybindingContribution {

    constructor(
        @inject(EditorKeybindingContext) protected readonly editorKeybindingContext: EditorKeybindingContext
    ) { }

    registerKeybindings(registry: KeybindingRegistry): void {
        [
            {
                command: 'editor.close',
                context: this.editorKeybindingContext,
                keybinding: "alt+w"
            },
            {
                command: 'editor.close.all',
                context: this.editorKeybindingContext,
                keybinding: "alt+shift+w"
            }
        ].forEach(binding => {
            registry.registerKeybinding(binding);
        });
    }
}
```

`commandId` 必须是预先注册且唯一的命令，`context` 是一个简单的类，可确保在某些条件下启用命令/键绑定组合。 编辑器的键绑定如下所示： 

**editor-keybinding.ts**
```typescript
@injectable()
export class EditorKeybindingContext implements KeybindingContext {
    constructor( @inject(EditorManager) protected readonly editorService: EditorManager) { }

    id = 'editor.keybinding.context';

    isEnabled(arg?: Keybinding) {
        return this.editorService && !!this.editorService.activeEditor;
    }
}
```

上下文还具有唯一的ID，然后可以使用该ID来注册该上下文中命令的多个键绑定。`isEnabled()` 方法是在给定条件下将上下文评估为true或false的地方。 请注意，上下文是可选参数，如果未提供，则默认为 `NOOP_CONTEXT`。 使用此上下文注册的键绑定将始终具有可用的上下文，从而使它们可以在应用程序中的任何位置生效。

使用id时，唯一的额外必需参数是 `keycode`，它基本上是一个包含实际键绑定的结构。以下是对应的结构：

**keys.ts**
```typescript
export declare type Keystroke = { first: Key, modifiers?: Modifier[] };
```
修饰符与平台无关，因此 `Modifier.M1` 在OS X上是Command，在Windows / Linux上是CTRL。key 字符串常量在keys.ts中定义

### 将 contribution 绑定到 KeybindingContribution

跟绑定命令 contributions 一样，键绑定 contributions 也需要按模块进行绑定，如下所示

**editor-frontend-module.ts**
```typescript
export default new ContainerModule(bind => {
    ...
    bind(CommandContribution).to(EditorCommandHandlers);
    bind(EditorKeybindingContext).toSelf().inSingletonScope();
    bind(KeybindingContext).toDynamicValue(context => context.container.get(EditorKeybindingContext));
    bind(KeybindingContribution).to(EditorKeybindingContribution);
});

```