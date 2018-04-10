---
title: spring-boot之Servlet、Filter、Listener配置
tags: spring boot
categories: spring boot
date: 2018-04-10 15:21:05
---
介绍spring boot如何配置原生Servlet、Filter、Listener
<!-- more -->

## 方案一

采用原生Servlet3.0的注解进行配置。

`@WebServlet`、`@WebListener`、`@WebFilter`是Servlet3.0api中提供的注解，通过注解可以完全代替web.xml中的配置。

然后spring boot通过`@ServletComponentScan`进行扫描即可。

### 例子

#### Servlet

```java
@WebServlet(name = "HelloServlet",urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {

    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().print("hello word");
        resp.getWriter().flush();
        resp.getWriter().close();
    }
}
```

#### Filter

```java
@WebFilter(urlPatterns = "/*", filterName = "HelloFilter")
public class HelloFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    	// do init
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // do filter

        // 放行，让其他Filter调用
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {
    	// do destroy
    }
}
```

#### Listener

```java
@WebListener
public class HelloListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
    	// do init
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
    	// do destroy
    }
}
```
常用的Listener还有ServletRequestListener、HttpSessionListener等。

#### 扫描

通过`@ServletComponentScan`扫描即可

```java
@SpringBootApplication
@ServletComponentScan
public class Application {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(Application.class, args);
    }

}
```

## 方案二

采用spring boot配置Bean的方式配置。

`ServletRegistrationBean`、`FilterRegistrationBean`、`ServletListenerRegistrationBean` 分别用来注册Servlet、Filter、Listener。

### 例子

对于方案一的例子，下面效果等同。

```java
@Bean
public ServletRegistrationBean helloServlet() {
    ServletRegistrationBean registration = new ServletRegistrationBean(new HelloServlet());
    registration.addUrlMappings("/hello");
    return registration;
}

@Bean
public FilterRegistrationBean helloFilter() {
    FilterRegistrationBean registration = new FilterRegistrationBean(new HelloFilter());
    registration.addUrlPatterns("/*");
    return registration;
}
@Bean
public ServletListenerRegistrationBean helloListener(){
    ServletListenerRegistrationBean servletListenerRegistrationBean = new ServletListenerRegistrationBean();
    servletListenerRegistrationBean.setListener(new HelloListener());
    return servletListenerRegistrationBean;
}
```

## 参考

[SpringBoot初始教程之Servlet、Filter、Listener配置(七)](https://blog.csdn.net/king_is_everyone/article/details/53116744)