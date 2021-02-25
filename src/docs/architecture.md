---
title: Overview
---

# 架构概述

本节介绍 Theia 的整体架构。

Theia旨在用作本机桌面应用程序以及在浏览器和远程服务器的环境中使用。为了让同一代码支持两种情况，Theia在两个单独的进程中运行，从而使一套代码能支持两种场景。这些进程分别称为前端和后端，它们通过WebSocket上的JSON-RPC消息或HTTP上的REST API进行通信。对于Electron，后端以及前端均在本地运行，而在远程环境中，后端将在远程主机上运行。

前端和后端过程都具有其依赖项注入（DI）容器（请参见下文），扩展的开发也需要基于 DI。

## 前端

前端进程负责渲染UI，在浏览器中，它只在渲染循环中运行，而在Electron中，它在Electron Window（实质上是能调用Electron和Node.js API的浏览器）中运行。因此，任何前端代码都可以将浏览器作为平台，而不是Node.js。

前端进程的启动将首先获取所有扩展的DI模块，然后再获取 `FrontendApplication` 实例并在其上调用 `start()`。

## 后端

后端进程在Node.js上运行。 我们使用express作为HTTP服务器。 它可能不使用任何需要浏览器（DOM API）作为平台的代码。

后端应用程序的启动需要在获取 `BackendApplication` 实例并在其上调用 `start(portNumber)` 之前载所有扩展的DI模块。

默认情况下，后端的 express 服务器还可以下发前端的代码。

## 平台分离

在扩展包的顶层文件夹中，包含如下子目录层级来区分各个平台：

 - `common` 目录下包含不依赖运行时的代码。
 - `browser` 目录下包含的代码需要运行在现代浏览器平台上(DOM API)。
 - `electron-browser` 目录下包含了需要 DOM API 及 Electron 渲染进程特定的 APIs 的前端代码
 - `node` 目录下包含了需要运行在 Node.js 下的后端代码。
 - `node-electron` 目录下包含了 Electron 特定的后端代码。

## 更多

有关Theia架构的高级概述，请参阅以下文档：

[Multi-Language IDE Implemented in JS - Scope and Architecture](https://docs.google.com/document/d/1aodR1LJEF_zu7xBis2MjpHRyv7JKJzW7EWI9XRYCt48)
