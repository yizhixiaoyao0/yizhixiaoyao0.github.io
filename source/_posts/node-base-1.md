---
title: 自用node基础篇-1
toc: true
copyright: true
date: 2022-02-10 00:02:53
tags:
  - node
categories:
  - node
---

测试博客，test

<!-- more -->

# 1 nodejs 可以做什么？

* 轻量级、高性能的web服务
* 前后端js同构开发
* 便捷高效的前端工程化

# 2 nodejs架构

  * natives modules
    - 当前曾内容由js实现
    - 提供应用程序可直接调用库， 例如fs、 path等
    - js语言无法直接操作底层硬件设置
  
  * builtin module 胶水层： 让node核心模块获得支持

  * v8、lib
     v8： 执行js代码、 提供桥梁接口
     libuv: 事件循环、事件队列、异步io；
     第三方库

# 3 nodejs单线程：主线撑是单线程

# 4 nodejs核心模块以及api使用


# 5 nodejs演化

io是计算机操作过程中最缓慢的

reactor模式，单线程完成多线程工作，实现异步io、事件驱动

nodejs更适合密集型高并发请求

# 6 node异步io和事件驱动

  **非阻塞io/阻塞io**

  重复调用io操作、判断io是否结束。 （read、select、poll、)

  期望实现无须主动判断的非阻塞io：

  异步io

  * io是应用程序的瓶颈所在
  * 异步io提高性能、不在原地等待结果返回

  * io操作属于操作系统级别， 平台都有对应的实现

  * nodejs单线程配合事件驱动架构以及libuv实现了异步io

  **事件驱动**
  > 事件驱动架构是软件开发中的通用模式

  主体发布消息， 其他实例接收消息。


# 7 单线程实现高并发
> nodejs 异步非阻塞io配合事件回调通知， 主线程是单线程。

劣势；cpu密集型会过多占用， 无法体现多核cpu的优势

```js
const http = require('http');

function sleepTime(time) {
  const sleep = Date.now() + time * 1000;
  while(Date.now() < sleep) {}
  return
}
sleepTime(4);
const server = http.createServer((req, res) => {
  res.end('server starting.....');
})

server.listen(8080, () => {
  console.log('starting')
})
```

# 8 nodejs 应用场景

1. io密集型高并发请求

2. 操作数据库提供api服务

3. 实时聊天应用程序


