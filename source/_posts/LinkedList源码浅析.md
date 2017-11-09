---
title: LinkedList源码浅析
tags: JDK集合类
categories: 源码浅析
date: 2017-11-09 21:07:20
---
探究JDK8中ArrayList源码
<!-- more -->

## 单向链表吗？

首先看内部`Node`如何定义：
```java
private static class Node<E> {
    E item; // 存储实际的元素
    Node<E> next; // 引用下一个Node节点
    Node<E> prev; // 引用前一个Node节点

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```
我想，你应该懂了。。

需要知道的是，内部有引用首尾`Node`的属性：
```java
/**
    * Pointer to first node.
    * Invariant: (first == null && last == null) ||
    *            (first.prev == null && first.item != null)
    */
transient Node<E> first;

/**
    * Pointer to last node.
    * Invariant: (first == null && last == null) ||
    *            (last.next == null && last.item != null)
    */
transient Node<E> last;
```

## 添加元素

首先回顾下数据结构的双向链表：

![双向链表插入](https://raw.githubusercontent.com/xuanbo/blog/master/source/images/LinkedList源码浅析/1.PNG)

至于`LinkedList`如何插入，就不贴源码了。

## 删除元素

再次回顾下数据结构的双向链表：

![双向链表删除](https://raw.githubusercontent.com/xuanbo/blog/master/source/images/LinkedList源码浅析/2.PNG)

至于`LinkedList`如何删除，也不贴源码了。。

## 什么，LinkedList还实现了Deque？

没错，有这种操作！毕竟双向链表，可以双向FIFO，没毛病。