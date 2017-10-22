---
title: Hexo + OSChina搭建个人博客
tags: Hexo + OSChina搭建个人博客
categories: 搭建个人博客
date: 2017-01-16 17:31:20
---
分享一波：如何使用Hexo + OSChina搭建个人博客.
<!-- more -->

## 环境搭建

### 安装Nodejs

*	官网[下载Nodejs](https://nodejs.org/en/download)
* 配置[淘宝镜像](http://blog.csdn.net/zhangwenwu2/article/details/52778521)

### 安装Git

[官网下载git](https://git-for-windows.github.io/)

### 安装Hexo

```
npm install -g hexo-cli
```

## 运行Hexo

安装Hexo完成后，依次执行下列命令，Hexo将会在指定文件夹中新建所需要的文件。

```
hexo init <folder>
cd <folder>
npm install
hexo generate
```

**注意：**将`folder`替换为自己的文件夹名称

项目目录如下：
```
├── .deploy       # 需要部署的文件
├── node_modules  # Hexo插件
├── public        # 生成的静态网页文件
├── scaffolds     # 模板
├── source        # 博客正文和其他源文件, 404 favicon CNAME 等都应该放在这里
|   ├── _drafts   # 草稿
|   └── _posts    # 文章
├── themes        # 主题
├── _config.yml   # 全局配置文件
└── package.json  # 依赖定义
```

下面我们在本地运行，看下子效果：
```
cd <folder>    # 切换到项目目录下
npm install    # install 依赖
hexo server    # 运行本地服务
```

浏览器输入：http://localhost:4000/

## 编辑博客

我们创建一个博客:
```
cd <folder>              # 切换到项目目录下
hexo new "MyNewPost"     # 创建一个名为MyNewPost.md的文件到source/_posts目录下
```

下面就可以使用md的语法愉快的玩耍了。

**注意：**与普通的.md文件不同的是需要在文件开头添加下面代码：
```
---
title:      # 文章标题
date:       # 文章日期
tags:       # 文章标签
categories: # 文章分类
---
```

例如，本篇博客：
```
---
title: Hexo + OSChina搭建个人博客
date: 2017-01-16 17:31:20
tags: Hexo + OSChina搭建个人博客
categories: 搭建个人博客
---
```

提示：启动服务器瞄瞄效果`hexo server`，可以边刷新边写看效果的哦！

## 生成静态文件

写完博客后，我们在本地生成静态文件：
```
cd <folder>         # 切换到项目目录下
hexo generate       # 生成静态文件到项目根目录的public文件夹中
```

## 发布静态Html文件到码云Pages上

*	注册一个[码云帐号](https://git.oschina.net/)，并创建一个项目
* 项目语言选HTML

这里使用git将项目中`public`文件夹下的文件管理起来，并推送到码云上。

首先安装`hexo-deployer-git`
```
npm install hexo-deployer-git --save
```

然后配置项目根目录`_config.yml`文件，在最后一行这里修改：
```
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: git                                            # 类型为git即可
  repo: https://git.oschina.net/wangxuanbo/blog.git    # 这里改为你创建的项目地址
  branch: master                                       # 这里选择分支
```

要注意的是，`_config.yml`还需要修改一个地方，在15行左后，修改`url`跟`root`，下面是我的配置：
```
# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and 
## root as '/child/'
url: http://wangxuanbo.oschina.io    # 修改为你的码云地址即可
root: /blog/                         # 修改为你创建的项目名
```

修改后，就可以发布到码云上了：
```
hexo deploy    # 输入你的码云账号密码就可以将public中的内容推送到远程了。
```

最后，使用码云的`Pages`服务。找到你项目托管到码云的页面`https://git.oschina.net/用户名/项目名`，找到Pages链接，进行部署。

## 参考

下面是我所参考的资料，特别是第二个，几乎是按照他的教程完成的，只是`_config.yml`中`url`配置没有说，我这里做了补充，如果你遇到不懂得地方，可以参考他的配置，毕竟他图文教程说得非常详细。

`_config.yml`中关于语言国际化配置，希望你能独立去探索。

参考如下：

*	[hexo官方网站](https://hexo.io)
*	[免费个人博客搭建教程（详细-图文）--Hexo + OSChina](http://z77z.oschina.io/2017/01/14/%E5%85%8D%E8%B4%B9%E4%B8%AA%E4%BA%BA%E5%8D%9A%E5%AE%A2%E6%90%AD%E5%BB%BA%E6%95%99%E7%A8%8B%EF%BC%88%E8%AF%A6%E7%BB%86-%E5%9B%BE%E6%96%87%EF%BC%89--Hexo+OSChina/)