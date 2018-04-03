---
title: Java访问HDFS集群
tags: hadoop
categories: hadoop
date: 2018-04-03 15:01:03
---
学习用Java访问HDFS集群。
<!-- more -->

## 客户端搭建

配置的每一个集群节点都可以做一个Hadoop客户端。但是我们一般都不会拿来做集群的服务器来做客户端，需要单独的配置一个客户端。

通常情况下我们写完程序，需要打包成jar传到集群中的某一个节点中，用hadoop jar命令运行。

由于我没有集群环境，也懒得打包成jar传到同学的服务器上（被我搭建成hadoop的伪集群）。因此在本地搭建一个伪集群，当作为客户端。

### windows环境下搭建hadoop

* [HadoopWindows7](https://github.com/Fespinola1/HadoopWindows7)克隆到本地
* 修改etc/hadoop/hadoop-env.cmd中JAVA_HOME
* 修改etc/hadoop/hdfs-site.xml中的目录
* 将bin/hadoop.dll复制到C:\Windows\System32中
* 将HadoopWindows7配置到环境变量HADOOP_HOME

完成后，就成为一个本地的伪集群了。我们后面拿它本地测试。

### 如何启动

类似linxu下，我们在sbin目录下执行start-dfs即可启动.


## API介绍

### HDFS的Java访问接口

* org.apache.hadoop.fs.FileSystem，文件系统的访问
* org.apache.hadoop.fs.Path，对文件系统路径的抽象
* org.apache.hadoop.conf.Configuration，读取、解析配置文件(如core-site.xml/hdfs-default.xml/hdfs-site.xml等)，或添加配置的工具类
* org.apache.hadoop.fs.FSDataOutputStream，输出流
* org.apache.hadoop.fs.FSDataInputStream，输入流

### Java访问HDFS主要编程步骤

* 构建Configuration对象，读取并解析相关配置文件
```java
Configuration conf=new Configuration();
// 设置相关属性
conf.set("fs.defaultFS","hdfs://IP:9000");
```

* 构建FileSystem对象，操作HDFS文件系统
```java
FileSystem fs = FileSystem.get(new URI("hdfs://IP:9000"), conf);
// 操作文件系统
fs.delete(new Path("/data.txt"));
```

## Java访问HDFS

### 打印HDFS某个路径下的文件

```java
/**
 * Hadoop FileSystem使用
 *
 * Created by xuan on 2018/4/3
 */
public class FileSystemUsage {

    private static final Logger LOG = LoggerFactory.getLogger(FileSystemUsage.class);

    /**
     * URI.create("hdfs://:9000")
     * ip为nameNode的ip
     */
    private final URI uri;

    public FileSystemUsage(URI uri) {
        this.uri = uri;
    }

    /**
     * 递归打印出Hadoop某个路径下的文件
     *
     * @param path Hadoop某个路径
     * @param recursive 是否递归
     * @throws IOException IOException
     */
    public void listFiles(final Path path, final boolean recursive) throws IOException {
        // 创建Configuration对象
        Configuration conf = new Configuration();
        // 创建FileSystem对象
        FileSystem fs = FileSystem.get(uri, conf);
        // 迭代给定的目录
        RemoteIterator<LocatedFileStatus> iterator = fs.listFiles(path, recursive);
        while (iterator.hasNext()) {
            LocatedFileStatus fileStatus = iterator.next();
            LOG.info("fileStatus: {}", fileStatus);
        }
    }

}
```

### 运行

进去本地hadoop的bin目录下，执行hadoop jar xxx.jar mainClass即可本地调试，很方便，省去上传到服务器上中了。

### 代码

代码上传到了github，[戳我](https://github.com/xuanbo/hadoop-examples/tree/master/hdfs-example)