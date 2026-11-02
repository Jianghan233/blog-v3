---
title: 小白部署尝试的开源博客
description: 第一次折腾开源博客，记录 Windows 下 GitHub SSH 公钥认证失败，以及本地文章没有同步到仓库的排查过程。
date: 2026-05-21 21:15:37
updated: 2026-11-02 17:46:26
image: https://img.han1130.top/img/2b0aeaead52a7d5a2f1363a9e2f02f77.png
categories: [技术]
tags: [建站, Git, GitHub, SSH]
recommend: 1
---

## 从起因说起

5 月 20 日晚上，参考 GitHub 上的开源项目和[康可ing](https://blog.yanxisishi.top/)的教程，开始了第一次搭博客的尝试。从晚上九点折腾起，拉代码、装依赖，总算让它在本地跑起来了。

结果准备把文件推到 GitHub 时，卡在了 SSH：

```text
git@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.
Please make sure you have the correct access rights
and the repository exists.
```

本地能打开，上传却不行。~~新手第一关，先学会看报错。~~

这里记录两个问题：先解决 GitHub 的 SSH 认证，再弄清为什么 `git push` 之后，仓库里的文件还是旧的。**下面的命令使用 Windows CMD**；除启动系统服务的部分外，在普通权限终端中操作即可。Git 命令都在博客项目目录执行。

## 一、先确认是不是在用 SSH

在项目文件夹的地址栏输入 `cmd` 并回车，打开该目录下的终端，执行：

```cmd
git remote -v
```

如果地址长这样：

```text
origin  git@github.com:用户名/仓库.git (fetch)
origin  git@github.com:用户名/仓库.git (push)
```

说明远程仓库使用 SSH，接着检查密钥。如果显示 `https://github.com/...`，那是 HTTPS 认证，下面的 SSH 配置不会直接解决它的问题。

## 二、准备密钥，把公钥交给 GitHub

### 检查有没有现成的密钥

```cmd
dir "%USERPROFILE%\.ssh"
```

常见文件是一对 `id_ed25519` 和 `id_ed25519.pub`，也可能是其他名称或 `id_rsa`。**不带 `.pub` 的是私钥，带 `.pub` 的是公钥**。只把公钥添加到 GitHub，私钥留在自己电脑上。

没有可用密钥时，再生成一对：

```cmd
ssh-keygen -t ed25519 -C "你的GitHub邮箱"
```

把邮箱换成自己的；这里的邮箱主要作为注释，不会自动把密钥绑定到账号。提示保存位置时，首次创建可以接受默认路径；如果提示文件已存在，先取消并检查，别覆盖旧密钥。随后按提示设置密钥口令，输入时终端不会显示字符。

### 添加到 GitHub 账号

查看刚生成的公钥：

```cmd
type "%USERPROFILE%\.ssh\id_ed25519.pub"
```

复制完整的一行内容，然后：

1. 登录 GitHub，点右上角头像 → **Settings**；
2. 左侧进入 **SSH and GPG keys**，点击 **New SSH key**，也可以直接打开[密钥设置页](https://github.com/settings/keys)；
3. **Title** 填便于辨认的名字，例如 `My-PC`；**Key type** 选择 **Authentication Key**；
4. 把公钥粘贴到 **Key**，点击 **Add SSH key**，按提示完成账号验证。

已有密钥时，可以先核对它是否已添加到正确账号，不必重新生成。

## 三、Windows 下让 ssh-agent 管理密钥

`ssh-agent` 用于管理密钥、减少重复输入口令。这里使用 Windows 自带的 OpenSSH；如果系统找不到相关命令或服务，先检查 Windows 的 OpenSSH 客户端是否安装。

### 启动系统服务

从开始菜单搜索 **命令提示符**，右键选择**以管理员身份运行**，执行：

```cmd
sc.exe config ssh-agent start= auto
net start ssh-agent
```

注意 `start= auto` 的等号后有一个空格。原来遇到的 `[SC] OpenService 失败 5：拒绝访问`，就是这一服务配置操作没有足够权限；不代表平时提交代码也要用管理员终端。

服务已启动时，第二条命令可能提示它已经运行，不需要重复启动。

### 加载密钥，再测试认证

回到普通 CMD，执行：

```cmd
ssh-add "%USERPROFILE%\.ssh\id_ed25519"
ssh-add -l
ssh -T git@github.com
```

如果生成密钥时设置了口令，`ssh-add` 会要求输入。`ssh-add -l` 应能列出已加载密钥的指纹。

首次连接可能询问是否信任主机。先对照[GitHub 的连接测试说明](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/testing-your-ssh-connection)核对主机指纹，确认后再输入 `yes`。

认证成功时会显示类似内容：

```text
Hi 用户名! You've successfully authenticated, but GitHub does not provide shell access.
```

这说明 GitHub 识别了你的身份。“不提供 shell access”是正常提示，测试命令退出码为 1 也不代表认证失败。不过，**账号认证成功和有权写入某个仓库是两回事**，还要核对问候语中的账号、远程地址和仓库权限。

### 测试成功，Git 却仍然报错

Git for Windows 可能使用自带的 SSH，与 Windows 的 `ssh-agent` 不是同一套。先在普通 CMD 中查看：

```cmd
where ssh
where ssh-add
git config --show-origin --get core.sshCommand
```

最后一条没有输出，通常只是没有显式设置该选项。若确认是客户端混用，可让**当前仓库**使用 Windows 系统 OpenSSH，再重试推送：

```cmd
git config core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"
```

这会保存到当前仓库的配置中，按需设置，具体可参考[GitHub 的 Windows 密钥与 agent 文档](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)。仍失败时用 `ssh -vT git@github.com` 查看认证日志，重点找它实际尝试了哪把密钥。

## 四、为什么 push 了，文件还是旧的

SSH 通了以后，还得分清 Git 的三个步骤：

```text
本地修改 ──git add──▶ 暂存区 ──git commit──▶ 本地提交 ──git push──▶ GitHub
```

**保存文件不等于提交，提交也不等于推送。** `git push` 显示 `Everything up-to-date`，只说明当前要推送的提交与远程一致，不能证明工作目录里的改动已经上传。

先检查：

```cmd
git status
git diff
```

确认文件改动符合预期，再把这篇文章加入暂存区：

```cmd
git add "content/posts/2026/blog-questions.md"
git diff --cached
git commit -m "update blog"
git push
```

路径换成实际修改的文件。`git diff --cached` 用来检查即将提交的内容；如果想用 `git add .`，要知道它也会暂存当前目录范围内的新增、修改和删除，先确认没有误删或混入凭据文件。

如果首次推送提示当前分支没有上游，先用 `git branch --show-current` 确认分支名。假设确实是 `main`，再执行：

```cmd
git push -u origin main
```

推送成功后，到 GitHub 对应仓库的同一分支查看文件和最新提交。如果收到 `non-fast-forward` 等错误，先检查远程是否有新提交，不要直接强制推送。

## 五、误删文章时，只恢复需要的文件

原来把 `git restore .` 理解成“恢复所有文件、回到上次提交”，这个说法不准确。它默认从**暂存区**恢复当前目录范围内的已跟踪文件，会覆盖未暂存的修改，也救不回从未被 Git 记录过的内容。

先看 `git status`。如果文章原本已被 Git 跟踪，只在本地误删、还没有暂存删除，可以单独恢复：

```cmd
git restore -- "content/posts/2026/blog-questions.md"
```

如果删除已经被 `git add` 暂存，但还没提交，先取消该文件的暂存，再恢复：

```cmd
git restore --staged -- "content/posts/2026/blog-questions.md"
git restore -- "content/posts/2026/blog-questions.md"
```

这两步会恢复该文件在最近一次提交中的版本，**不会保留它尚未提交的修改**，操作前先确认。已经提交的删除则需要查历史版本，不能继续套用上面的步骤；具体行为见[Git restore 文档](https://git-scm.com/docs/git-restore)。

这次先把“本地修改 → 提交 → 推送”这条链路弄清楚。至于让别人通过域名打开博客，下一篇再记录托管、域名和图床的配置。
