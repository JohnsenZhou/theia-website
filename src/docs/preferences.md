---
title: Preferences
---

# Preferences

Theia有一个首选项服务，该服务允许模块获取首选项值，提供默认首选项并监听首选项更改。

首选项可以保存在工作空间的根目录下的 `.theia/settings.json` 或Linux系统的 `$HOME/.theia/settings.json` 下。对于Windows系统，默认情况下用户设置将位于 `%USERPROFILE%/.theia/settings.json` 中（类似于`C:\Users\epatpol\.theia/settings.json`）。

文件必须包含一个有效的JSON，其中包含首选项的名称和值（请注意，以下首选项名称不是官方的，仅用作示例）。你还可以根据需要将注释添加到settings.json文件，如下：

```
{
    // Enable/Disable the line numbers in the monaco editor
	"monaco.lineNumbers": "off",
    // Tab width in the editor
	"monaco.tabWidth": 4,
	"fs.watcherExcludes": "path/to/file"
}
```

让我们以使用首选项服务的 filesystem 作为示例：

## 使用 Inverseify 将默认首选项作为模块进行改造

提供一些首选项的值。模块必须提供有效的json schema，该 schema 将用于验证首选项配置。模块必须将以下PreferenceContribution 绑定到这样的值：

```typescript
export interface PreferenceSchema {
    [name: string]: Object,
    properties: {
        [name: string]: object
    }
}

export interface PreferenceContribution {
    readonly schema: PreferenceSchema;
}
```

For instance, the filesystem binds it like so:
例如，文件系统将其绑定为：
```typescript
export const filesystemPreferenceSchema: PreferenceSchema = {
    "type": "object",
    "properties": {
        "files.watcherExclude": {
            "description": "List of paths to exclude from the filesystem watcher",
            "additionalProperties": {
                "type": "boolean"
            }
        }
    }
};

bind(PreferenceContribution).toConstantValue(
{
    schema: filesystemPreferenceSchema
});
```

以下是一些有助于编写验证schema的链接：

* [JSON schema spec](http://json-schema.org/documentation.html)
* [Online JSON validator](https://jsonlint.com/)
* [Online JSON schema validator](http://www.jsonschemavalidator.net/)

## 通过配置侦听首选项更改

要使用首选项的值，只需从容器中获取注入的PreferenceService
```typescript
const preferences = ctx.container.get(PreferenceService);
```

对于文件系统，该服务是在绑定开始时获取的。在这里，你可以使用 onPreferenceChanged 方法注册首选项更改的回调。

```typescript

constructor(@inject(PreferenceService) protected readonly prefService: PreferenceService
	prefService.onPreferenceChanged(e => { callback }
```

回调参数 `e`:

```typescript
export interface PreferenceChangedEvent {
    readonly preferenceName: string;
    readonly newValue?: any;
    readonly oldValue?: any;
}
```

尽管可以直接在所需的类中使用它，但是文件系统提供了特定于文件系统首选项的代理首选项服务（它在后台使用首选项服务）。这允许更快，更有效地搜索首选项（因为它在文件系统首选项服务中搜索首选项，而不是通过更通用的首选项服务在所有首选项中搜索首选项）。从某种意义上说，只有通知正在监视与模块相关的特定首选项的模块才更有效。为此，有一个绑定文件系统配置的代理接口，就像使用首选项代理接口一样：

```typescript
export type PreferenceProxy<T> = Readonly<T> & Disposable & PreferenceEventEmitter<T>;
export function createPreferenceProxy<T extends Configuration>(preferences: PreferenceService, configuration: T): PreferenceProxy<T> {
    /* Register a client to the preference server
    When a preference is received, it is validated against the schema and then fired if valid, otherwise the default value is provided.

    This proxy is also in charge of calling the configured preference service when the proxy object is called i.e editorPrefs['preferenceName']

    It basically forwards methods to the real object, i.e dispose/ready etc.
}
```

要使用该代理，只需将其绑定到新的类型 X = PreferenceProxy<CONFIGURATION_INTERFACE>，然后使用上述方法将 X 绑定到代理。

```typescript
export interface FileSystemConfiguration {
    'files.watcherExclude': { [globPattern: string]: boolean }
}

export const FileSystemPreferences = Symbol('FileSystemPreferences');
export type FileSystemPreferences = PreferenceProxy<FileSystemConfiguration>;

export function createFileSystemPreferences(preferences: PreferenceService): FileSystemPreferences {
    return createPreferenceProxy(preferences, defaultFileSystemConfiguration, filesystemPreferenceSchema);
}

export function bindFileSystemPreferences(bind: interfaces.Bind): void {

    bind(FileSystemPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get(PreferenceService);
        return createFileSystemPreferences(preferences);
    });

    bind(PreferenceContribution).toConstantValue({ schema: filesystemPreferenceSchema });

}
```

最后，在模块中使用文件系统配置。只需在需要时将其注入即可。然后，你可以像这样访问首选项：

```typescript
const patterns = this.preferences['files.watcherExclude'];
```

你还可以像这样注册首选项更改：

```typescript
this.toDispose.push(preferences.onPreferenceChanged(e => {
    if (e.preferenceName === 'files.watcherExclude') {
        this.toRestartAll.dispose();
    }
}));
```


```typescript
constructor(...,
        @inject(FileSystemPreferences) protected readonly preferences: FileSystemPreferences) {
	...
         this.toDispose.push(preferences.onPreferenceChanged(e => {
            if (e.preferenceName === 'files.watcherExclude') {
                this.toRestartAll.dispose();
            }
        }));
	...
}
```

## 修改首选项时的首选项流程

在 ${workspace}/.theia/ 或 `os.homedir()`/.theia/ 中修改settings.json时，这将触发JSON首选项服务器中的事件。当前，有一个CompoundPreferenceServer可以管理不同的服务器（范围），例如 workspace/user/defaults（通过上面的contributions提供）。接下来，PreferenceService管理该服务器并在其之上添加一个更方便的api（即getBoolean，getString等）。它还允许客户注册首选项更改。然后，可以直接通过在模块中注入或通过更特定的代理（例如上面的文件系统配置）来使用此PreferenceService。

这里例子中，修改首选项文件后的流程为：

```
.theia/settings.json -> JsonPreferenceServer -> CompoundPreferenceServer -> PreferenceService -> PreferenceProxy<FileSystemConfiguration> -> FileSystemWatcher
```

## 获取首选项的值

对于 filesystem，将使用与上述相同的代理配置来访问首选项。

```typescript
    if (this.prefService['preferenceName']) {
    ...
    }

    if (this.prefService['preferenceName2']) {
    ...
    }
})
```

之所以如此，是因为如上所述，该代理将仅调用 prefService.get('preferenceName')。

## TODO/FIXME for preferences
* Add scopes with server priority in CompoundPreferenceServer
* Add autocomplete/description when modifying the settings.json from within theia


