---
title: Java编写MapReduce程序
tags: hadoop
categories: hadoop
date: 2018-04-09 15:37:54
---
学习用Java编写WordCount MapReduce程序，并通过Hadoop运行。
<!-- more -->

## 说明

> JavaApi基于hadoop2.6.0-cdh5.14.0版本

## 编写WordCount程序

### 代码

```java
public class WordCount {

    public static class Map extends Mapper<LongWritable, Text, Text, IntWritable> {

        private final static IntWritable one = new IntWritable(1);

        private Text word = new Text();

        @Override
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            // 一行数据
            String line = value.toString();
            // 分割成单词，每个单词的value赋值为1
            StringTokenizer tokenizer = new StringTokenizer(line);
            while (tokenizer.hasMoreTokens()) {
                word.set(tokenizer.nextToken());
                // 通过上下文将结果输出，作为Reduce的输入
                context.write(word, one);
            }
        }
    }

    public static class Reduce extends Reducer<Text, IntWritable, Text, LongWritable> {

        @Override
        public void reduce(Text key, Iterable<IntWritable> values, Context context)
                throws IOException, InterruptedException {
            long sum = 0;
            for (IntWritable val : values) {
                // 累计单词出现的次数
                sum += val.get();
            }
            // 通过上下文将结果输出
            context.write(key, new LongWritable(sum));
        }
    }

    public static void main(String[] args) throws Exception {
        // 创建Configuration
        Configuration conf = new Configuration();

        // 创建Job
        Job job = Job.getInstance(conf, "wordCount");

        // 设置job的处理类
        job.setJarByClass(WordCount.class);

        // 设置作业的输入路径
        FileInputFormat.addInputPath(job, new Path(args[0]));

        // 设置Map相关的参数（主类、输出的key/value类型）
        job.setMapperClass(Map.class);
        job.setMapOutputKeyClass(Text.class);
        job.setMapOutputValueClass(IntWritable.class);

        // 设置Reduce相关参数（主类、输出的key/value类型）
        job.setReducerClass(Reduce.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(LongWritable.class);

        // 设置作业的输出路径
        FileOutputFormat.setOutputPath(job, new Path(args[1]));

        // 提交作业，等待完成
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

### 主要流程

* 编写map类
* 编写reduce类
* 通过job将map-reduce串起来

## 打包并上传到服务器

### 打包

```
mvn clean package -DskipTests
```

### 上传到服务器

略。我上传到/xuanbo/map-reduce-example-1.0.0-SNAPSHOT.jar

## 运行

* 如果没有配置hadoop的环境变量则，进入bin目录
* 在路劲/xuanbo下创建一个word.input文件，作为输入
```
vim /xuanbo/word.input
```

* 内容如下
```
hadoop mapreduce hive
hbase spark storm
sqoop hadoop hive
spark hadoop
```

* 将/xuanbo/word.input文件上传到hdfs到根目录
```
hdfs dfs -put /xuanbo/word.input /
```

* 运行程序，将结果输出到hdfs的/output/wordcount目录
```
hadoop jar /xuanbo/map-reduce-example-1.0.0-SNAPSHOT.jar com.xinqing.mapreduce.WordCount /word.input /output/wordcount
```

* 查看结果
```
hdfs dfs -cat /output/wordcount/part-r-00000
```

* 结果如下
```
hadoop	3
hbase	1
hive	2
mapreduce	1
spark	2
sqoop	1
storm	1
```

## 代码

代码上传到了github，[戳我](https://github.com/xuanbo/hadoop-examples/tree/master/map-reduce-example)