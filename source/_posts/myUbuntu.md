---
title: ubuntu16.04 gnome自定义
date: 2017-10-03 21:28:36
tags: ubuntu美化
categories: ubuntu
---

![界面展示](https://github.com/xuanbo/blog/blob/master/source/images/myUbuntu/show.png)

# 1安装ubuntu16.04 gnome

* 下载iso
* 写入U盘
* bios设置U盘启动
* 按照提示安装

# 2美化

## 2.1主题

推荐[adapta-gtk-theme](https://github.com/adapta-project/adapta-gtk-theme)

## 2.2图标

推荐[la-capitaine-icon-theme](https://github.com/keeferrourke/la-capitaine-icon-theme)

## 2.3字体

推荐文泉驿字体,`sudo apt install ttf-wqy-microhei`

## 2.4扩展

* Alternatetab
* Coverflow alt-tab
* Dash to dock
* Netspeed
* Openweather
* User themes

## 2.5终端

* 安装zsh
`sudo apt install zsh`
* 先安装git
`sudo apt install git`
* 采用oh-my-zsh进行配置
```
安装:
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"

切换shell
chsh -s /bin/zsh

重启
```

# 3常用软件

* 搜狗输入法
* 截图软件shutter
* 网易云音乐
* vs code
* chrome
* 视频播放器mpv
* 待补充