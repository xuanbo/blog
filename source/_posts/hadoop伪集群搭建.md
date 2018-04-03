---
title: hadoop伪集群搭建
tags: hadoop
categories: hadoop
date: 2018-04-03 11:37:44
---
介绍hadoop的伪集群环境搭建，以及基本的HDFS命令，适用于个人学习。
<!-- more -->

## 伪集群搭建

> 本教程采用hadoop2.9搭建，基于同学购买的腾讯centeros6.5入门版安装搭建。
> [推荐参考官网](http://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html)

### java环境

我安装的openjdk8，网上说最好安装oraclejdk，安装教程省略，网上一大推。

### 安装hadoop

#### 下载并解压

过程略，记住自己解压后hadoop的路径，我的为/xuanbo/hadoop-2.9.0，下面该路径以HADOOP_HOME代替。

#### 修改配置文件

* 编辑etc/hadoop/hadoop-env.sh文件 
```bash
cd /HADOOP_HOME
vim etc/hadoop/hadoop-env.sh
```

* 修改配置文件中的JAVA_HOME
```
# set to the root of your Java installation
export JAVA_HOME=/usr/java/latest
```

这时单机版就已经配置成功了，但是此时使用的是本地文件系统，而不是分布式文件系统。我们先测试一哈（此时确保在HADOOP_HOME下）:
```bash
mkdir input
cp etc/hadoop/*.xml input
bin/hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-2.9.0.jar grep input output 'dfs[a-z.]+'
cat output/*
```
最后如果输入内容，就成功搭建了单机版。我们下面继续配置成伪集群。

* 修改etc/hadoop/core-site.xml
```xml
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
    </property>
</configuration>
```

* 修改etc/hadoop/hdfs-site.xml
```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
</configuration>
```

现在已经配置成功了，我们启动看看效果。


**提示：** 你可能想在YARN上执行job，[请直接官网教程，配置一哈](http://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/SingleCluster.html#YARN_on_a_Single_Node)

* 格式化文件系统
```bash
bin/hdfs namenode -format
```

* 启动NameNode daemon和DataNode daemon
```bash
sbin/start-dfs.sh
```
注意：这里会提示你输入root的密码。

* 浏览器输入http://ip:50070/查看NameNode的相关信息。注意ip为你服务器的ip。

到这里，我们就成功的搭建了一个伪集群环境。下面玩一玩hadoop的hdfs的几个常用命令。

## 基本的HDFS命令

> 命令类似于linux命令，需要会点儿常用命令即可。 注意所有的操作均在HADOOP_HOME/bin下。

### 基本操作

* 查询根目录文件  hdfs dfs -ls /
* 删除文件  hdfs dfs -rm filename
* 创建文件夹  hdfs dfs -mkdir name
* 递归创建文件夹  hdfs dfs -mkdir -P name
* 上传文件  hdfs dfs -put localfile hadoopfile
* 浏览文件  hdfs dfs -cat hadoopfile

### 练习

在hadoop的文件系统中创建一个文件夹，并把本地的文件上传进去。

* 在hadoop中创建input文件夹
```bash
hdfs dfs -mkdir /input
```

* 将本地/xuanbo/hadoop-2.9.0.tar.gz上传到hadoop的/input中
```bash
hdfs dfs -put /xuanbo/hadoop-2.9.0.tar.gz /input
```

* 查看上传的文件
```bash
hdfs dfs -ls /input
```

## 博客推荐

* [起航Hadoop](http://www.cnblogs.com/zhangyinhua/tag/%E8%B5%B7%E8%88%AAHadoop/)

这位道友是2017-10写的，比较新，不像其他的1.x，推荐参考一哈。