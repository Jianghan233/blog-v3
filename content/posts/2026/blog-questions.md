---
title:小白部署尝试的开源博客
description: 讲述关于ssh报错和git push上传失败的故事。
date: 2026-05-21 21:15:37
updated: 2026-05-21 21:15:37
image: https://img.han1130.top/img/2b0aeaead52a7d5a2f1363a9e2f02f77.png
categories: [技术]
tags: []
recommend: true
---
## 从起因说起

5月20号，适合和同学出去的一天，也就是在这一天的晚上，试着仿照GitHub的开源库，和[康可ing](https://blog.yanxisishi.top/)的教程，开始了萌新的第一次尝试，从21点到现在拉取请求，安装运行环境（还好去年安装过）废了老大劲才部署好，之后保存上传，**报错ssh**  ~~不可能有人比我笨吧~~

试着上传发现输入git push：

```plain
git push 
git@github.com: Permission denied (publickey). fatal: Could not read from remote repository. 
Please make sure you have the correct access rights and the repository exists.
```

这是：这是*SSH公钥没有配置成功* 或 *Git 没有使用*正确的 SSH key*。

## 一、先检查是不是 SSH 仓库

执行：

```plain
git remote -v
```

如果看到：

```plain
origin  git@github.com:用户名/仓库.git (fetch)
origin  git@github.com:用户名/仓库.git (push)
```

说明你在用 SSH。

### 检查 SSH key

执行：

```cmd
dir %USERPROFILE%\.ssh
```

查看：

```text
C:\Users\Admin\.ssh
```

是否存在：

```text
id_ed25519
id_ed25519.pub
```

或者：

```text
id_rsa
id_rsa.pub
```

### 生成 SSH key（如果没有）

执行：

```cmd
ssh-keygen -t ed25519 -C "你的GitHub邮箱"
```

例如：

```cmd
ssh-keygen -t ed25519 -C "11111@.com"
```

一路回车即可。

生成后：

```text
C:\Users\Admin\.ssh\
```

会出现：

```text
id_ed25519
id_ed25519.pub
```

### 上传公钥到 GitHub

查看公钥：

```cmd
type %USERPROFILE%\.ssh\id_ed25519.pub
```

复制输出内容。

然后打开 GitHub：

[https://github.com/settings/keys](https://github.com/settings/keys)

点击：

```text
New SSH key
```

填写：

### Title

```text
My-PC
```

粘贴刚才复制的内容。保存。

### Windows 下正确启动 ssh-agent

于是执行：

```cmd
sc config ssh-agent start= auto
```

注意：

```text
start= auto
```

等号后必须有空格！！！

等号后必须有空格！！！

等号后必须有空格！！！

### 管理员权限问题

第一次执行：

```cmd
sc config ssh-agent start= auto
```

报：

```text
[SC] OpenService 失败 5:
拒绝访问
```

原因：

```text
CMD 没有管理员权限
```

以管理员身份运行 CMD即可

### 成功开启 ssh-agent

执行：

```cmd
sc config ssh-agent start= auto
```

成功：

```text
[SC] ChangeServiceConfig SUCCESS
```

然后：

```cmd
net start ssh-agent
```

成功：

```text
OpenSSH Authentication Agent 服务已经启动成功
```

### 添加 SSH key

执行：

```cmd
ssh-add %USERPROFILE%\.ssh\id_ed25519
```

成功：

```text
Identity added: C:\Users\Admin\.ssh\id_ed25519
```

### 测试 GitHub SSH

执行：

```cmd
ssh -T git@github.com
```

返回：

```text
Hi Jianghan233! You've successfully authenticated
```

说明：

```text
SSH 已完全配置成功
```

之后又是一个小问题，上传后在github的文件和本地不一样可能原因是：

**你本地改了大量文件，但还没有 commit。**

**所以（可以以管理员身份运行一下）：**

```plain
git push
```

```
如果是  everything to-up-date
```

**实际上只是：**

```plain
“已经提交(commit)的内容”是最新的
```

## 二、现在怎么同步到 GitHub

**直接：**

```plain
git add .
```

**这一步会：**

* 添加修改
* 记录删除
* 添加新文件

**然后：**

```plain
git commit -m "update blog"
git push
```

**这样 GitHub 就会：**

**✅** 更新修改文件
✅删除那些 md 文件
✅添加新文章

### 如果是误删怎么办

**恢复：**

```plain
git restore .
```

这个命令会：**恢复所有文件**

**回到上一次 commit 状态。**
