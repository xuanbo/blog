---
title: hadoop基础概念
tags: hadoop
categories: hadoop
date: 2018-04-03 10:30:41
---
hadoop基础概念，介绍HDFS的优缺点，以及读写流程。
<!-- more -->

## hadoop基础演练

### 慕课网视频

* [hadoop基础演练](https://www.imooc.com/video/16284)

通过该视频了解下基本知识。

## 知识整理

### HDFS概念

* 数据块
	* 抽象块而非整个文件作为存储单元，屏蔽了文件的概念，文件分块
	* 默认大小为64MB，一般设置为128M，备份X3
* NameNode（主，一个NameNode，多个DataNode）
	* 管理文件系统的命名空间，存放文件元数据
	* 维护着文件系统的所有文件和目录，文件与数据块的映射
	* 记录每个文件中各个块所在数据节点的信息
* DataNode（从，一个NameNode，多个DataNode）
	* 存储并检索数据块
	* 向NameNode更新所存储块的列表

### HDFS的优缺点

#### 优点

* 适合大文件存储，支持TB、PB级的数据存储，并有副本策略
* 适合大文件存储，支持TB、PB级的数据存储，并有副本策略
* 支持流式数据访问，一次写入，多次读取最高效

#### 缺点

* 不适合大量小文件存储
* 不适合并发写入，不支持随机文件修改
* 不支持随机读等低延时的访问方式

### HDFS的读写流程

#### HDFS写流程

1. 客户端向NameNode发起写数据请求
2. 分块写入DataNode节点，DataNode自动完成副本备份
3. DataNode向NameNode汇报存储完成，NameNode通知客户端

#### HDFS读流程

1. 客户端向NameNode发起读数据请求
2. NameNode找出距离最近的DataNode节点信息
3. 客户端从DataNode分块下载文件