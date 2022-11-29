---
title: 每日一题 —— 两个整数之和
toc: true
copyright: true
date: 2022-11-15 22:39:07
tags:
  - 算法与数据结构
categories:
  - 算法与数据结构
---

给你两个整数 a 和 b ，不使用 运算符 + 和 - ​​​​​​​，计算并返回两整数之和。

<!-- more -->

### 给你两个整数 a 和 b ，不使用 运算符 + 和 - ​​​​​​​，计算并返回两整数之和。

- 两个整数 a, b， a ^ b 是无进位的相加；
- a&b 得到每一位的进位；
- 无进位相加的结果与进位不断的异或，直到进位为 0；

```js
var getSum = function (a, b) {
  return b ? getSum(a ^ b, (a & b) << 1) : a;
};
```
