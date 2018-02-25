---
title: mongo读写分离问题
tags: mongo
categories: 数据库
date: 2018-02-02 19:44:01
---
mongo读写分离，造成读写不一致的问题
<!-- more -->

## 问题描述

目前公司数据库以mongo为主，采用复制集部署。在业务中遇到过好几次写完立即读取，仍然读取到的是旧的数据。

## 问题诊断

本质上mongo复制集之间数据同步是有个延迟，因此写操作后，primary会将数据同步到secondaries。如果立即读，则是在secondaries中读取，此时有几率出现读写不一致的情况，即读取到旧的数据。

![mongo复制集](https://docs.mongodb.com/manual/_images/replica-set-read-write-operations-primary.bakedsvg.svg)

## 如何解决

* 采用redis缓存，写操作将把数据写入缓存，读操作则从缓存中命中，可以解决问题。
* 在业务上处理。例如写操作后，loading个1秒。。。或者写完即返回，规避再次查询的问题。

## mongo使用心得

使用mongo大概约1年的时间，大多数情况下用的非常爽。但也有时会遇到比较坑的问题：

* 读写分离问题。
* 分页问题。如果数据量很小则采用skip分页即可；如果数据量大，采用索引加通过$gte和$lte进行查询。
* 没有事务。选择了mongo就不要想这个问题了，公司业务完全没有事务，rpc调来调去，失败了只能重试，可能把数据搞成脏数据。