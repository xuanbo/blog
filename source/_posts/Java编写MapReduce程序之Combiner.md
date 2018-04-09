---
title: Java编写MapReduce程序之Combiner
tags: hadoop
categories: hadoop
date: 2018-04-09 17:01:55
---
MapReduce编程之Combiner
<!-- more -->

## Combiner介绍

Combiner相当于在Map的本地做一哈Reduce，然后再Reduce，从而减少网络传输次数，提高效率。

## Java程序

对于上一节中的代码，我们只需要加一句`job.setCombinerClass(Reduce.class);`代码即可。下面是main方法中的代码块：

```java
// 创建Configuration
Configuration conf = new Configuration();

// 创建Job
Job job = Job.getInstance(conf, "wordCount");

// 设置job的处理类
job.setJarByClass(WordCountCombiner.class);

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

// 设置job的Combiner处理类，其实逻辑上与Reduce是一样的，只不过在输出的时候，先在本地Reducer一哈
job.setCombinerClass(Reduce.class);

// 设置作业的输出路径
FileOutputFormat.setOutputPath(job, new Path(args[1]));

// 提交作业，等待完成
System.exit(job.waitForCompletion(true) ? 0 : 1);
```

## 使用场景

只要在本地Reduce后的结果不影响整体的结果即可，就像wordcount程序。

## 代码

[戳我](https://github.com/xuanbo/hadoop-examples/tree/master/map-reduce-example)