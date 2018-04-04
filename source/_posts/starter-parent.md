---
title: starter-parent
tags: spring boot
categories: spring boot
date: 2018-03-26 10:00:23
---
自用的spring boot starter模块
<!-- more -->

## 功能

* [mongo starter模块](#mongo-starter)
* [redis starter模块](#redis-starter)
* [jwt starter模块](#jwt-starter)
* [starter如何使用的demo](https://github.com/xuanbo/starter-parent/tree/master/example)

## mongo-starter模块

> 基于spring-boot-data-mongo-starter封装，采用mongoTemplate作为内部的操作，提供基本的crud以及分页

### baseDao

```java
public interface BaseDao<T extends Entity> {

    /**
     * 根据id查询记录
     *
     * @param id 记录id
     * @return T
     */
    T findById(String id);

    /**
     * 批量获取记录
     *
     * @param ids 记录id集合
     * @return List<T>
     */
    List<T> findByIds(List<String> ids);

    /**
     * 查询一条记录
     *
     * @param query Query
     * @return T
     */
    T findOne(Query query);

    /**
     * 查询多条记录
     *
     * @param query Query
     * @return List<T>
     */
    List<T> find(Query query);

    /**
     * 统计记录条数
     *
     * @param query Query
     * @return Long
     */
    Long count(Query query);

    /**
     * 插入记录
     *
     * @param entity T
     */
    void insert(T entity);

    /**
     * 插入或更新记录
     *
     * @param entity T
     */
    void save(T entity);

    /**
     * 更新所有满足条件的记录
     *
     * @param query Query
     * @param update Update
     */
    void update(Query query, Update update);

    /**
     * 根据id删除记录
     *
     * @param id 记录id
     */
    void deleteById(String id);

    /**
     * 批量删除记录
     *
     * @param ids 记录集合
     */
    void deleteByIds(List<String> ids);

    /**
     * 删除记录
     *
     * @param query Query
     */
    void delete(Query query);

    /**
     * 分页获取数据，_id降序获取数据
     *
     * @param criteria 查询条件
     * @param endId 最后一条记录(不包括)
     * @param limit 每页获取数目
     * @return PageVO<T>
     */
    PageVO<T> page(Criteria criteria, String endId, Integer limit);

    /**
     * 分页获取数据
     *
     * @param criteria 查询条件
     * @param sort 排序
     * @param endId 最后一条记录(不包括)
     * @param limit 每页获取数目
     * @return PageVO<T>
     */
    PageVO<T> page(Criteria criteria, Sort sort, String endId, Integer limit);

    /**
     * 分页获取数据
     *
     * @param criteria 查询条件
     * @param pageable 分页信息
     * @return Page<T>
     */
    Page<T> page(Criteria criteria, Pageable pageable);
}
```

### example

* 定义实体：

```java
@Document(collection = "T_Demo")
public class Demo extends Entity {

    private String name;

    // fields、getters、setters
}
```

* dao接口

```java
public interface DemoDao extends BaseDao<Demo> {
}
```

* dao实现类

```java
@Repository
public class DemoDaoImpl extends BaseDaoImpl<Demo> implements DemoDao {
}
```
	
* 使用

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class DemoDaoTest {

    @Autowired
    private DemoDao demoDao;

    @Test
    public void insert() {
        Demo demo = new Demo();
        demo.setName("demo");
        demoDao.insert(demo);
    }

    // 省略掉baseDao中的其他方法
}
```

## redis-starter模块

> 基于jedis封装，只支持JedisPool和JedisSentinelPool自动配置

### 功能

* 自动配置jedis，redisService内部引用了Pool<Jedis>实例，根据配置自动注入JedisPool或JedisSentinelPool
* 通过redisService进行简单的functional操作

### jedisService

```java
public interface RedisService {

    /**
     * 获取jedis实例
     *
     * @return Jedis
     */
    Jedis getResource();

    /**
     * 执行
     *
     * @param handler JedisHandler
     * @param <T> 执行结果类型
     * @return 执行结果，发生异常会返回null
     */
    <T> T execute(JedisHandler<T> handler);

    /**
     * 执行，异常回调
     *
     * @param handler JedisHandler
     * @param callback 异常回调
     * @param <T> 执行结果类型
     * @return 执行结果，错误发生异常会调用callback
     */
    <T> T execute(JedisHandler<T> handler, ErrorCallback<T> callback);

}
```

### example

* 配置

```yaml
redis:
  database: 0
  host: 127.0.0.1
  port: 6379
  password: pwd
  ssl: false
  timeout: 3

  # 默认配置JedisPool
  pool:
    maxIdle: 8
    minIdle: 0
    maxActive: 8
    maxWait: -1
  # 配置sentinel则会配置JedisSentinelPool
  # sentinel:
    # master名称
    # master: myMaster
    # 备节点
    # nodes:
     # - 127.0.0.1: 6379
     # - 127.0.0.2: 6379
```

* 使用

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class ApplicationTest {

    private static final Logger LOG = LoggerFactory.getLogger(ApplicationTest.class);

    @Autowired
    private RedisService redisService;

    @Test
    public void getResource() {
        Jedis jedis = redisService.getResource();
        // do something
        LOG.info("jedis: {}", jedis);
        // 需要手动释放
        jedis.close();
    }

    @Test
    public void execute() {
        // 内部会释放
        redisService.execute(jedis -> jedis.set("com.xinqing.example.redis", "ApplicationTest"));
    }

    @Test
    public void executeCallback() {
        // 内部会释放，第二个参数为异常时callback
        String value = redisService.execute(jedis -> jedis.get("com.xinqing.example.redis"), t -> "errorValue");
        LOG.info("value: {}", value);
    }

}
```

## jwt-starter

> 采用io.jsonwebtoken.Jwts来做底层的jwt签名、解析。

### example

* 添加配置

```
jwt:
  # 过期毫秒
  expire: 1000 * 60 * 60
  # 加密字符串
  secret: mysecret
  # 签名算法 @see io.jsonwebtoken.SignatureAlgorithm
  algorithm: HS256
```

* 生成jwt

```
@Validated
@RestController
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResultVO<?> login(@Validated(UserLoginGroup.class) @RequestBody User user) {
        if (userService.login(user)) {
            // 登录成功生成jwt，这里可以把角色信息放入，例如roleId
            Map<String, Object> claims = new HashMap<>();
            claims.put("username", user.getUsername());
            String token = jwtService.build(claims);
            return ResultVO.ok(token);
        }
        return ResultVO.fail("用户名不存在或密码错误");
    }

}
```

* 解析jwt

```
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger LOG = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private static final PathMatcher matcher = new AntPathMatcher();

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if(isProtected(request)) {
            String token = request.getHeader("Authorization");
            try {
                // 检查jwt令牌, 如果令牌不合法或者过期, 里面会直接抛出异常, 下面的catch部分会直接返回
                Claims claims = jwtService.parse(token);
                // 下面可以将放入的用户相关信息取出，放入ThreadLocal，在业务中直接获取用户信息
                String username = claims.get("username", String.class);
            } catch (Exception e) {
                LOG.warn("jwt parser exception", e);
                // jwt验证不正确，错误处理
                PrintWriter writer = response.getWriter();
                writer.write(JSON.toJSONString(ResultVO.fail(CommonError.TOKEN_INVALID)));
                writer.flush();
                return;
            }
        }
        // 如果jwt令牌通过了检测, 那么就把request传递给后面的RESTFul api
        filterChain.doFilter(request, response);
    }

    private boolean isProtected(HttpServletRequest request) {
        if (request.getMethod().equals(HttpMethod.OPTIONS.name())) {
            LOG.debug("jwtFilter skip options request");
            return false;
        }
        return matcher.match("/api/**", request.getServletPath());
    }
}
```

我们只需要使用JwtService来进行生成jwtToken、解析即可。

## 代码

* [github](https://github.com/xuanbo/starter-parent)