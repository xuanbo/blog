---
title: redis删除bigKey
tags: redis
categories: 数据库
date: 2018-03-26 09:44:13
---
string类型控制在10KB以内，hash、list、set、zset元素个数不要超过5000，拒绝bigKey
<!-- more -->

## jedis使用代码块

```java
Jedis jedis = null;
try {
    jedis = jedisPool.getResource();
    // 具体的命令
    jedis.executeCommand()
} catch (Exception e) {
    logger.error("op key {} error: " + e.getMessage(), key, e);
} finally {
    // 注意这里不是关闭连接，在JedisPool模式下，Jedis会被归还给资源池。
    if (jedis != null) 
        jedis.close();
}
```

## 删除bigKey

> redis 4.0已经支持key的异步删除，欢迎使用

* Hash删除: hscan + hdel

```java
public void delBigHash(String host, int port, String password, String bigHashKey) {
    Jedis jedis = new Jedis(host, port);
    if (password != null && !"".equals(password)) {
        jedis.auth(password);
    }
    ScanParams scanParams = new ScanParams().count(100);
    String cursor = "0";
    do {
        ScanResult<Entry<String, String>> scanResult = jedis.hscan(bigHashKey, cursor, scanParams);
        List<Entry<String, String>> entryList = scanResult.getResult();
        if (entryList != null && !entryList.isEmpty()) {
            for (Entry<String, String> entry : entryList) {
                jedis.hdel(bigHashKey, entry.getKey());
            }
        }
        cursor = scanResult.getStringCursor();
    } while (!"0".equals(cursor));
    
    //删除bigkey
    jedis.del(bigHashKey);
}
```

* List删除: ltrim

```java
public void delBigList(String host, int port, String password, String bigListKey) {
    Jedis jedis = new Jedis(host, port);
    if (password != null && !"".equals(password)) {
        jedis.auth(password);
    }
    long llen = jedis.llen(bigListKey);
    int counter = 0;
    int left = 100;
    while (counter < llen) {
        //每次从左侧截掉100个
        jedis.ltrim(bigListKey, left, llen);
        counter += left;
    }
    //最终删除key
    jedis.del(bigListKey);
}
```

* Set删除: sscan + srem

```java
public void delBigSet(String host, int port, String password, String bigSetKey) {
    Jedis jedis = new Jedis(host, port);
    if (password != null && !"".equals(password)) {
        jedis.auth(password);
    }
    ScanParams scanParams = new ScanParams().count(100);
    String cursor = "0";
    do {
        ScanResult<String> scanResult = jedis.sscan(bigSetKey, cursor, scanParams);
        List<String> memberList = scanResult.getResult();
        if (memberList != null && !memberList.isEmpty()) {
            for (String member : memberList) {
                jedis.srem(bigSetKey, member);
            }
        }
        cursor = scanResult.getStringCursor();
    } while (!"0".equals(cursor));
    
    //删除bigkey
    jedis.del(bigSetKey);
}
```

* SortedSet删除: zscan + zrem

```java
public void delBigZset(String host, int port, String password, String bigZsetKey) {
    Jedis jedis = new Jedis(host, port);
    if (password != null && !"".equals(password)) {
        jedis.auth(password);
    }
    ScanParams scanParams = new ScanParams().count(100);
    String cursor = "0";
    do {
        ScanResult<Tuple> scanResult = jedis.zscan(bigZsetKey, cursor, scanParams);
        List<Tuple> tupleList = scanResult.getResult();
        if (tupleList != null && !tupleList.isEmpty()) {
            for (Tuple tuple : tupleList) {
                jedis.zrem(bigZsetKey, tuple.getElement());
            }
        }
        cursor = scanResult.getStringCursor();
    } while (!"0".equals(cursor));
    
    //删除bigkey
    jedis.del(bigZsetKey);
}
```

## 参考

* [阿里云Redis开发规范](http://blog.didispace.com/%E9%98%BF%E9%87%8C%E4%BA%91Redis%E5%BC%80%E5%8F%91%E8%A7%84%E8%8C%83/)
* [JedisPool资源池优化](http://blog.didispace.com/JedisPool%E8%B5%84%E6%BA%90%E6%B1%A0%E4%BC%98%E5%8C%96/)
* [Jedis常见异常汇总](http://blog.didispace.com/Jedis%E5%B8%B8%E8%A7%81%E5%BC%82%E5%B8%B8%E6%B1%87%E6%80%BB/)