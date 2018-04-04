---
title: spring-boot使用@Async
tags: spring boot
categories: spring boot
date: 2018-04-04 11:14:42
---
介绍spring boot如何使用异步@Async注解执行，以及自定义异步任务线程池。
<!-- more -->

## 如何使用

* 添加@EnableAsync注解开启异步：
```java
@SpringBootApplication
@EnableAsync
public class App {

	public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

}
```
或者加在某个被@Configuration注解的配置类上，保证被扫描到即可。

* 方法上添加@Async注解
```java
@Service
public class DempServiceImpl implements DemoService {

    private static final Logger LOG = LoggerFactory.getLogger(DempServiceImpl.class);

    @Async
    public void say() {
        try {
            LOG.info("say start");
            // 模拟执行很久的一个任务
            Thread.sleep(10000);
            LOG.info("say end");
        } catch (InterruptedException e) {
            LOG.error(e.getMessage(), e);
        }
    }
}
```

* 测试看看
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class AppTest {

    private static final Logger LOG = LoggerFactory.getLogger(AppTest.class);

    @Autowired
    private DemoService demoService;

    @Test
    public void say() throws IOException {
        demoService.say();
        LOG.info("done");

        // 这里为了防止主线程执行完就退出啦
        System.in.read();
    }
}
```

* 看看结果
```
2018-04-04 11:22:48.104  INFO 6236 --- [           main] .s.a.AnnotationAsyncExecutionInterceptor : No task executor bean found for async processing: no bean of type TaskExecutor and no bean named 'taskExecutor' either
2018-04-04 11:22:48.104  INFO 6236 --- [           main] com.example.AppTest                      : done
2018-04-04 11:22:48.104  INFO 6236 --- [cTaskExecutor-1] c.example.service.impl.DempServiceImpl   : say start
2018-04-04 11:22:58.110  INFO 6236 --- [cTaskExecutor-1] c.example.service.impl.DempServiceImpl   : say end
```
首先`No task executor bean found for async processing: no bean of type TaskExecutor and no bean named 'taskExecutor' either`它告诉我们没有自定义任务线程池，后续我们自定义。

其次我们发现先输出了done，而且是在cTaskExecutor-1这个线程中输入的日志，说明异步执行啦！

## 注意事项

在使用的过程中，我发现这样一段代码：
```java
@Service
public class DempServiceImpl implements DemoService {

    private static final Logger LOG = LoggerFactory.getLogger(DempServiceImpl.class);

    @Async
    public void say1() {
        // xxx
    }

    public void say2() {
        // xxx

        // 调用say1()
        say1();
    }
}
```
当我们通过DemoService调用say2()，当执行say1()时，并没有异步。是的，我没有骗你。看了几篇博客后，说是代理问题。

简单的说就是@Async注解的方法执行时，需要代理才能执行（就是通过xxBean.call的时候）。我们在自己内部调用是this引用，并没有走到代理。

因此，我们使用时要**外部调用**！

## 自定义异步任务线程池

根据日志的提示，我们很容易知道spring boot要我们怎么配置，就是配置一个**类型为TaskExecutor，bean的名称为taskExecutor**的Bean咯。

### 自定义配置

```java
@SpringBootApplication
@EnableAsync
public class App {

    // 我先放到启动类里面，可以放到@Configuration标注的配置类中哦
    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 线程池前缀，可以随意指定。
        executor.setThreadNamePrefix("myTaskExecutor");
        // 设置线程池参数
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100);
        // 设置拒绝策略，由调用者执行
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return executor;
    }
```

## 测试看看

```
2018-04-04 11:34:18.751  INFO 6964 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService  'taskExecutor'
2018-04-04 11:34:18.860  INFO 6964 --- [           main] com.example.AppTest                      : Started AppTest in 1.564 seconds (JVM running for 2.875)
2018-04-04 11:34:18.907  INFO 6964 --- [           main] com.example.AppTest                      : done
2018-04-04 11:34:18.907  INFO 6964 --- [myTaskExecutor1] c.example.service.impl.DempServiceImpl   : say start
2018-04-04 11:34:28.920  INFO 6964 --- [myTaskExecutor1] c.example.service.impl.DempServiceImpl   : say end
```
对的，你没有看错，它说`Initializing ExecutorService  'taskExecutor'`，就是初始化我们自定义的任务线程池啦。

后面看打印say方法中的的日志线程名为`myTaskExecutor1`，说明用了我们的啦。