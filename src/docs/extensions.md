---
title: Extensions
---

# 扩展

Theia 由扩展包构成。扩展包是一个npm包，它暴露了许多有助于创建DI容器的DI模块（`ContainerModule`）。

通过在应用程序的 `package.json` 中添加 npm 包的依赖项来使用扩展包，扩展包能够在运行时安装和卸载，这将触发重新编译和重启。

通过 DI 模块，扩展包能提供从类型到具体实现的绑定，即提供服务和功能。
