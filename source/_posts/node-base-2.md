---
title: node事件循环
toc: true
copyright: true
date: 2022-02-10 15:36:46
tags:
  - node
categories:
  - node
---

主线程是单线程执行的，但是 Node.js 存在多线程执行，多线程包括 setTimeout 和异步 I/O 事件。其实 Node.js 还存在其他的线程，包括垃圾回收、内存优化等。

<!-- more-->

{% note blue 'fas fa-bullhorn' modern %}转载至拉钩教育....{% endnote %}

# 事件循环模型

{% image /images/libuv.jpeg, width=80% %}

可以看到，这一流程包含六个阶段，每个阶段代表如下：

- timers:
  本阶段执行已经被 setTimeout() 和 setInterval() 调度的回调函数，简单理解就是由这两个函数启动的回调函数。

- pending callbacks：
  本阶段执行某些系统操作（如 TCP 错误类型）的回调函数。

- idle、prepare：
  仅系统内部使用，你只需要知道有这 2 个阶段就可以。

- poll：
  检索新的 I/O 事件，执行与 I/O 相关的回调，其他情况 Node.js 将在适当的时候在此阻塞。这也是最复杂的一个阶段，所有的事件循环以及回调处理都在这个阶段执行，接下来会详细分析这个过程。

- check：
  setImmediate() 回调函数在这里执行，setImmediate 并不是立马执行，而是当事件循环 poll 中没有新的事件处理时就执行该部分，

# 运行起点

从图 1 中我们可以看出事件循环的起点是 timers。

{% codeblock lang:js %}
setTimeout(() => {
console.log("1");
}, 0);
console.log("2");
{% endcodeblock %}

在代码 setTimeout 中的回调函数就是新一轮事件循环的起点，那么为什么先输出 2 后输出 1？

这里有一个非常关键点，当 Node.js 启动后，会初始化事件循环，处理已提供的输入脚本，它可能会先调用一些异步的 API、调度定时器，或者 process.nextTick()，然后再开始处理事件循环。因此可以这样理解，Node.js 进程启动后，就发起了一个新的事件循环，也就是事件循环的起点。

# Node.js 事件循环

事件循环主要包括微任务和宏任务。

- **微任务**：在 Node.js 中微任务包含 2 种——process.nextTick 和 Promise。微任务在事件循环中优先级是最高的，因此在同一个事件循环中有其他任务存在时，优先执行微任务队列。并且 process.nextTick 和 Promise 也存在优先级，process.nextTick 高于 Promise。

- **宏任务**：在 Node.js 中宏任务包含 4 种——setTimeout、setInterval、setImmediate 和 I/O。宏任务在微任务执行之后执行，因此在同一个事件循环周期内，如果既存在微任务队列又存在宏任务队列，那么优先将微任务队列清空，再执行宏任务队列。这也解释了我们前面提到的第 3 个问题，事件循环中的事件类型是存在优先级。

## 执行阶段主要处理三个核心逻辑。

- 同步代码。

- 将异步任务插入到微任务队列或者宏任务队列中。

- 执行微任务或者宏任务的回调函数。在主线程处理回调函数的同时，也需要判断是否插入微任务和宏任务。根据优先级，先判断微任务队列是否存在任务，存在则先执行微任务，不存在则判断在宏任务队列是否有任务，有则执行。

如果微任务和宏任务都只有一层时，那么看起来是比较简单的，比如下面的例子：

```js
const fs = require("fs");

// 首次事件循环执行

console.log("start");

/// 将会在新的事件循环中的阶段执行

fs.readFile("./test.conf", { encoding: "utf-8" }, (err, data) => {
  if (err) throw err;

  console.log("read file success");
});

setTimeout(() => {
  // 新的事件循环的起点

  console.log("setTimeout");
}, 0);

/// 该部分将会在首次事件循环中执行

Promise.resolve().then(() => {
  console.log("Promise callback");
});

/// 执行 process.nextTick

process.nextTick(() => {
  console.log("nextTick callback");
});

// 首次事件循环执行

console.log("end");
```

1. 根据上面介绍的执行过程，我们来分析下上面代码的执行过程：

2. 第一个事件循环主线程发起，因此先执行同步代码，所以先输出 start，然后输出 end；

3. 再从上往下分析，遇到微任务，插入微任务队列，遇到宏任务，插入宏任务队列，分析完成后，微任务队列包含：Promise.resolve 和 process.nextTick，宏任务队列包含：fs.readFile 和 setTimeout；

4. 先执行微任务队列，但是根据优先级，先执行 process.nextTick 再执行 Promise.resolve，所以先输出 nextTick callback 再输出 Promise callback；

再执行宏任务队列，根据宏任务插入先后顺序执行 setTimeout 再执行 fs.readFile，这里需要注意，先执行 setTimeout 由于其回调时间较短，因此回调也先执行，并非是 setTimeout 先执行所以才先执行回调函数，但是它执行需要时间肯定大于 1ms，所以虽然 fs.readFile 先于 setTimeout 执行，但是 setTimeout 执行更快，所以先输出 setTimeout ，最后输出 read file success。

可以得到:

```
start
end
nextTick callback
Promise callback
setTimeout
read file success
```

但是当微任务和宏任务又产生新的微任务和宏任务时，又应该如何处理呢？如下代码所示：

```js
const fs = require("fs");

setTimeout(() => {
  // 新的事件循环的起点

  console.log("1");

  fs.readFile("./config/test.conf", { encoding: "utf-8" }, (err, data) => {
    if (err) throw err;

    console.log("read file sync success");
  });
}, 0);

/// 回调将会在新的事件循环之前

fs.readFile("./config/test.conf", { encoding: "utf-8" }, (err, data) => {
  if (err) throw err;

  console.log("read file success");
});

/// 该部分将会在首次事件循环中执行

Promise.resolve().then(() => {
  console.log("poll callback");
});

// 首次事件循环执行

console.log("2");
```

在上面代码中，有 2 个宏任务和 1 个微任务，宏任务是 setTimeout 和 fs.readFile，微任务是 Promise.resolve。

1. 整个过程优先执行主线程的第一个事件循环过程，所以先执行同步逻辑，先输出 2。

2. 接下来执行微任务，输出 poll callback。

3. 再执行宏任务中的 fs.readFile 和 setTimeout，由于 fs.readFile 优先级高，先执行 fs.readFile。但是处理时间长于 1ms，因此会先执行 setTimeout 的回调函数，输出 1。这个阶段在执行过程中又会产生新的宏任务 fs.readFile，因此又将该 fs.readFile 插入宏任务队列。

4. 最后由于只剩下宏任务了 fs.readFile，因此执行该宏任务，并等待处理完成后的回调，输出 read file sync success。

根据上面的分析，我们可以得出最后的执行结果，如下所示：

```
2
poll callback
1
read file success
read file sync success

```

在上面的例子中，我们来思考一个问题，主线程是否会被阻塞，具体我们来看一个代码例子：

```js
const fs = require("fs");
setTimeout(() => {
  // 新的事件循环的起点
  console.log("1");
  sleep(10000);
  console.log("sleep 10s");
}, 0);
/// 将会在 poll 阶段执行
fs.readFile("./test.conf", { encoding: "utf-8" }, (err, data) => {
  if (err) throw err;
  console.log("read file success");
});
console.log("2");
/// 函数实现，参数 n 单位 毫秒 ；
function sleep(n) {
  var start = new Date().getTime();
  while (true) {
    if (new Date().getTime() - start > n) {
      // 使用  break  实现；
      break;
    }
  }
}
```

我们在 setTimeout 中增加了一个阻塞逻辑，这个阻塞逻辑的现象是，只有等待当次事件循环结束后，才会执行 fs.readFile 回调函数。这里会发现 fs.readFile 其实已经处理完了，并且通知回调到了主线程，但是由于主线程在处理回调时被阻塞了，导致无法处理 fs.readFile 的回调。因此可以得出一个结论，主线程会因为回调函数的执行而被阻塞，这也符合图 2 中的执行流程图。

如果把上面代码中 setTimeout 的时间修改为 10 ms，你将会优先看到 fs.readFile 的回调函数，因为 fs.readFile 执行完成了，并且还未启动下一个事件循环，修改的代码如下：

```js
setTimeout(() => {
  // 新的事件循环的起点
  console.log("1");
  sleep(10000);
  console.log("sleep 10s");
}, 10);
```

最后我们再来回答第 5 个问题，当所有的微任务和宏任务都清空的时候，虽然当前没有任务可执行了，但是也并不能代表循环结束了。因为可能存在当前还未回调的异步 I/O，所以这个循环是没有终点的，只要进程在，并且有新的任务存在，就会去执行。

# 实践分析

了解了整个原理流程，我们再来实践验证下 Node.js 的事件驱动，以及 I/O 到底有什么效果和为什么能提高并发处理能力。我们的实验分别从同步和异步的代码性能分析对比，从而得出两者的差异。

Node.js 不善于处理 CPU 密集型的业务，就会导致性能问题，如果要实现一个耗时 CPU 的计算逻辑，处理方法有 2 种：

直接在主业务流程中处理；

通过网络异步 I/O 给其他进程处理。
