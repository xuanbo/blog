---
title: Java访问HDFS集群
tags: hadoop
categories: hadoop
date: 2018-04-03 15:01:03
---
学习用Java访问HDFS集群。
<!-- more -->

## 客户端搭建

网上说： 配置的每一个集群节点都可以做一个Hadoop客户端。但是我们一般都不会拿来做集群的服务器来做客户端，需要单独的配置一个客户端。

通常情况下我们写完程序，需要打包成jar传到集群中的某一个节点中，用hadoop jar命令运行。

### windows环境下搭建hadoop

* [HadoopWindows7](https://github.com/Fespinola1/HadoopWindows7)克隆到本地
* 修改etc/hadoop/hadoop-env.cmd中JAVA_HOME
* 修改etc/hadoop/hdfs-site.xml中的目录
* 将bin/hadoop.dll复制到C:\Windows\System32中
* 将HadoopWindows7配置到环境变量HADOOP_HOME

完成后，就成为一个本地的伪集群了。后面可以拿它本地测试。

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

## 直接连接集群

不知道为啥别人不推荐直接连接，我直接连接在centeros上搭建的伪集群。直接运行单元测试用例，简单粗暴。

```
public class FileSystemTest {

    private static final Logger LOG = LoggerFactory.getLogger(FileSystemTest.class);

    private FileSystem fs;
    private Configuration conf;

    @Before
    public void setup() throws IOException, InterruptedException {
        conf = new Configuration();
        fs = FileSystem.get(URI.create("hdfs://ip(NameNode的公网ip):9000"), conf, "root");
    }

    @Test
    public void listFiles() throws IOException {
        RemoteIterator<LocatedFileStatus> it = fs.listFiles(new Path("/"), true);
        while (it.hasNext()) {
            LocatedFileStatus fileStatus = it.next();
            LOG.info("fileStatus: {}", fileStatus);
        }
    }

    @Test
    public void mkdirs() throws IOException {
        fs.mkdirs(new Path("/test/a"));
    }

    @Test
    public void copyFromLocalFile() throws IOException {
        fs.copyFromLocalFile(new Path("/download/rabbitmq-server-windows-3.7.3.zip"), new Path("/test/a"));
    }

    @Test
    public void copyToLocalFile() throws IOException {
        fs.copyToLocalFile(new Path("/test/a/hadoop-2.6.0-cdh5.14.0.tar.gz"), new Path("/download"));
    }

    @Test
    public void deleteOnExit() throws IOException {
        fs.deleteOnExit(new Path("/test/a/rabbitmq-server-windows-3.7.3.zip"));
    }

    @After
    public void destroy() throws IOException {
        fs.close();
        conf = null;
    }
}
```

### 代码

代码上传到了github，[戳我](https://github.com/xuanbo/hadoop-examples/tree/master/hdfs-example)