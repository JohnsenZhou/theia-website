---
title: TextMate Coloring
---


# TextMate Support in Theia

TextMate语法使我们能够为大多数源文件进行准确的代码高亮修饰，即使只是在语法层面也是如此。语义代码高亮修饰可以由Language Server等提供。

TextMate语法主要有两种格式：`.plist` 和 `.tmLanguage.json`，Theia都支持。

您可以在此处阅读有关TextMate语法的[更多信息](https://macromates.com/manual/en/language_grammars)。

> Note: grammars for a particular language should go inside the dedicated
> extension for said language. `@theia/textmate-grammars` is just a registry for
> languages that currently do not have any specific extension for them.

## Adding new grammars

In order to contribute a new grammar for a language, the usual pattern is to
create a `data` folder under your extension's root, and store the different
grammars here.

```
extension/
    data/
        grammars go here
    lib/
        ...
    src/
        ...
    package.json
    ...
```

Then, inside your `package.json` you would declare the following property in
order to publish the grammars along the source and built files.

```json
  "files": [
    "data",
    "lib",
    "src"
  ],
```

From your extension, you can now contribute via the
`LanguageGrammarDefinitionContribution` contribution point.

```ts
@injectable()
export class YourContribution implements LanguageGrammarDefinitionContribution {

    readonly id = 'languageId';
    readonly scopeName = 'source.yourLanguage';

    registerTextmateLanguage(registry: TextmateRegisty) {
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: require('../data/yourGrammar.tmLanguage.json'),
                }
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}
```

In the case were you would use `.plist` grammars, you cannot use `require` in
order to directly obtain the content, because Webpack will instead return the
name of a file to fetch from the server. In that case, the following pattern
applies in order to fetch the file's content:

```ts
@injectable()
export class YourContribution implements LanguageGrammarDefinitionContribution {

    readonly id = 'languageId';
    readonly scopeName = 'source.yourLanguage';

    registerTextmateLanguage(registry: TextmateRegisty) {
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                const response = await fetch(require('../data/yourGrammar.plist'));
                return {
                    format: 'plist',
                    content: await response.text(),
                }
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}
```