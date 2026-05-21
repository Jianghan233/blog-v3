---
title:小白部署尝试的开源博客
description: 讲述关于ssh报错和git push上传失败的故事。
date: 2026-05-21 21:15:37
updated: 2026-05-21 21:15:37
image: # 封面图推荐 2:1，不含与标题重复的文字
categories: [技术]
tags: []
---
## 从起因说起

5月20号嘛，适合和同学出去的一天呢，也就是在这一天的晚上，试着仿照GitHub的开源库，和康可ing大佬的教程，开始了萌新的第一次尝试，从21点到现在拉取请求，安装运行环境（还好去年安装过）废了老大劲才部署好，之后保存上传，**报错ssh**，查了一下聊天记录如下[https://chatgpt.com/share/6a0dcbd3-a958-83ec-afb4-46d87e690653](https://chatgpt.com/share/6a0dcbd3-a958-83ec-afb4-46d87e690653) 有帮助的话最好了（不可能有人比我笨吧）

之后又是一个小问题，上传后在github的文件和本地不一样可能原因是：

**你本地改了大量文件，但还没有 commit。**

**所以（可以以管理员身份运行一下）：**

```plain
git push
Everything up-to-date
```

**实际上只是：**

```plain
“已经提交(commit)的内容”是最新的
```

# 二、现在怎么同步到 GitHub

如果：这些修改和删除都是你故意的

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
```

**最后：**

```plain
git push
```

**这样 GitHub 就会：**

**✅** 更新修改文件
✅删除那些 md 文件
✅添加新文章

# 三、如果是误删怎么办

**恢复：**

```plain
git restore .
```

**这个命令会：**

```plain
恢复所有文件
```

**回到上一次 commit 状态。**
