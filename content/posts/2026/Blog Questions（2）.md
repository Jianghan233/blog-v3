---
title: 博客的托管、域名和图床
description: 用 Vercel 部署博客、Cloudflare 管理域名解析，再配合 R2 和 PicList 存放文章图片。
date: 2026-05-23 20:47:03
updated: 2026-11-02 17:32:37
image: https://img.han1130.top/photo/e7267902f3495e35ddaeb4adb56811bb.png
categories: [技术]
tags: [建站, Vercel, Cloudflare, R2, 图床]
recommend: 1
---
上一篇（[小白部署尝试的开源博客](/2026/blog-questions)）折腾到半夜，总算让博客在本地跑起来了。但“本地能跑”和“别人能点开”是两件事，这次把部署、域名和图床接起来：

```text
文章 ──git push──▶ GitHub ──自动构建──▶ Vercel ──▶ blog.han1130.top
图片 ──PicList──▶ Cloudflare R2 ──自定义域名──▶ img.han1130.top
```

下面的域名、桶名都用我的配置举例，照着做时换成自己的。

## 一、把博客部署到 Vercel

Vercel 连接 GitHub 仓库后，会自动拉代码、安装依赖、构建并部署，不用自己买服务器或配 Nginx。

1. 打开 [Vercel](https://vercel.com/)，用 GitHub 登录，进入 **Add New → Project**；
2. 找到 `blog-v3`，点 **Import**。看不到仓库时，先检查 GitHub App 的授权范围；
3. 检查框架是否识别为 **Nuxt**。这个项目位于仓库根目录，Root Directory 保持 `./`，构建命令和输出目录优先使用框架默认值；
4. 确认 Node.js 满足 `package.json` 的 `engines.node` 和平台支持范围，包管理器与项目的 `packageManager`、锁文件一致；
5. 点 **Deploy**，等状态变成 **Ready**，打开分配的 `xxx.vercel.app` 域名验证。

如果构建失败，到 **Deployments → 本次部署 → Build Logs** 看具体错误。重点检查运行环境、依赖安装和构建命令，别只盯着最后一句“构建失败”。如果访问时要求登录，再检查部署的访问保护。

以后更新文章，确认改动后提交、推送即可：

```bash
git add "content/posts/2026/Blog Questions（2）.md"
git commit -m "update blog"
git push
```

文件名换成实际修改的文章。默认推送到生产分支（通常是 `main`）才会更新正式站点，其他分支和 PR 通常生成预览部署。

> 平台域名在中国大陆部分网络下可能访问不稳定。自定义域名方便长期使用，但不会改变托管位置，也不保证解决连通性或速度问题。

## 二、买域名，把 DNS 交给 Cloudflare

我在阿里云买的域名。购买前除了看名字，还要比较**首年价和续费价**，按平台要求填写真实资料、完成验证。域名需要续费，宽限和赎回规则因后缀而异，最好提前设好提醒。

域名注册商和 DNS 服务商可以分开：注册、续费留在阿里云，解析交给 Cloudflare。这样后面绑定 R2 图片域名也方便。

1. 登录 [Cloudflare](https://dash.cloudflare.com/)，添加 `han1130.top`，选择 **Free** 套餐；
2. 核对自动导入的 DNS 记录，补齐已有网站、邮箱需要的记录，扫描不保证完整；
3. 复制平台实际分配的两个 NS 地址，形如 `ada.ns.cloudflare.com`，不要照抄示例；
4. 如果旧服务开启了 DNSSEC，先按[官方迁移步骤](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)移除旧 DS 等配置，切换完成后再启用 Cloudflare DNSSEC；
5. 到阿里云**域名管理 → 修改 DNS 服务器**，把原 NS 替换成这两个地址，等待 Cloudflare 显示 **Active**。

注意，第 5 步是在注册商处更换 DNS 服务器，不是在解析列表里加两条 NS 记录。等待期间可以先配好后续记录，已有业务在新旧 DNS 中都应保留可用配置。

可以用下面的命令查看某个递归 DNS 当前查到的 NS：

```bash
nslookup -type=ns han1130.top 8.8.8.8
```

返回分配的 Cloudflare NS，说明这个查询节点的结果已更新，其他网络仍可能有缓存。如果查询超时，换个当前网络可访问的 DNS 再试，不要反复切换 NS。

> 域名实名认证和 ICP 备案是两回事。本文使用境外托管，不因绑定域名而需要办理 ICP 备案；以后接入中国内地服务器或 CDN 节点时，要重新确认要求，参考[备案场景说明](https://cloud.tencent.com/document/product/243/19630)。

## 三、把博客域名指向 Vercel

DNS 接管后，还要告诉它博客放在哪里。先选定读者使用的地址，下面三个地址需要分别配置：

| 想使用的地址 | Cloudflare 的“名称” | Vercel 通常要求的记录 |
| --- | --- | --- |
| `blog.han1130.top` | `blog` | CNAME，目标是一个域名 |
| `www.han1130.top` | `www` | CNAME，目标是一个域名 |
| `han1130.top`（根域名） | `@` | A，目标是一个 IPv4 地址 |

**本文使用第一种，只需要配置 `blog`，不用额外添加 `www` 和 `@`。** 如果你选另外两种，把下面的地址和名称对应替换即可。实际记录类型、目标值以 Vercel 给该域名的要求为准，见[官方域名配置说明](https://vercel.com/docs/domains/working-with-domains/add-a-domain)。

### 先在 Vercel 找到要填的值

1. 登录 Vercel，从控制台点进已经部署成功的 `blog-v3` 项目，进入 **Settings → Domains**；
2. 点击 **Add Domain**（添加域名，按钮名称可能略有不同），输入 `blog.han1130.top`，不带 `https://` 或路径；若要求选择环境，本文绑定正式站点，选择 **Production**，然后保存；
3. 在域名列表找到刚添加的地址。尚未解析时通常显示 **Invalid Configuration**，展开该行的配置说明，部分界面需点 **Edit / 查看详情**，找到要求添加的 DNS 记录；
4. 对照 **Type（类型）、Name（名称）、Value（值）** 三项。这里通常是 `CNAME`、`blog` 和一个 Vercel 目标域名，把 **Value 完整复制**下来。不要把自己的博客域名、示例中的 `xxx` 或随便找到的 Vercel IP 当成这个值。

如果页面显示的是 `www` 或 `@`，先确认正在查看的是否是你想绑定的那个地址。如果提示需要 TXT 所有权验证，另外按提示添加 TXT，不能用它替代网站的 CNAME / A 记录。

### 再到 Cloudflare 逐项填写

1. 登录 Cloudflare，在域名列表点进 **`han1130.top`**，不是在 R2 桶里操作；
2. 左侧进入 **DNS → Records（记录）**，点 **Add record（添加记录）**；
3. 按下面填写：

   | Cloudflare 字段 | 本文填写内容 |
   | --- | --- |
   | Type / 类型 | 选择 `CNAME` |
   | Name / 名称 | `blog`，表示 `blog.han1130.top` |
   | Target / 目标 | 粘贴刚从 Vercel 复制的 **Value**，不加 `https://` 或路径 |
   | Proxy status / 代理状态 | 点云朵切换为 **DNS only / 仅 DNS（灰云）** |
   | TTL | 保持 **Auto / 自动** |

4. 点击 **Save（保存）**，在列表中核对记录。如果已有同名旧网站记录，先确认用途，再修改或替换冲突项，别把其他地址或邮箱记录一起删掉。

如果选的是 `www.han1130.top`，就使用 Vercel 为 **www 那一行**给出的目标，名称填 `www`。如果选的是根域名，则按 Vercel 要求选择 `A`、名称填 `@`，把它给出的 IP 填进 **IPv4 address（IPv4 地址）**字段。

> 例如，教程里常见的“CNAME / www / 某个域名”和“A / @ / 某个 IP”，分别对应 `www` 与根域名。**不是要同时给 `www` 添加 CNAME 和 A**：同一个名称的 CNAME 不能与 A / AAAA 并存。如果 Vercel 给你的具体方案不同，按它显示的类型填写。

### 回到 Vercel 验证

回到 **Settings → Domains**，刷新或点击域名旁的重新检查按钮。等待配置显示有效、HTTPS 证书签发完成，再打开 `https://blog.han1130.top`。

也可以在本机终端查询这条记录：

```bash
nslookup -type=cname blog.han1130.top
```

灰云状态下，结果中的目标应与 Vercel 要求的 CNAME 一致；刚保存未查到时，等 DNS 缓存刷新后再试。若绑定的是根域名，则用 `nslookup -type=a han1130.top` 检查返回的 IP。

想让根域名和 `www` 都能打开，需要在 Vercel **分别添加两个地址**，并在 Cloudflare 配好各自记录；如果只保留一个主要入口，再在 Vercel 的域名设置中把另一个设为重定向到主地址。DNS 解析本身不会让浏览器地址栏自动跳转。

本文采用灰云，让浏览器直接连接 Vercel，这也是[官方优先建议的方式](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment)。橙云并非一定导致证书失败，但会增加证书验证、缓存和访客 IP 识别的配置工作。灰云直连时，Cloudflare 的 SSL/TLS 加密模式不控制这条 HTTPS 连接。

## 四、用 R2 存文章图片

图片可以放进 `public/`，少量配图这样做很省心。我单独用图床，是想减少仓库体积，让上传、缓存和迁移都能独立管理。Git 不会每次推送都重传所有旧图，但图片及其历史版本仍会让仓库变大。

R2 是 Cloudflare 的对象存储，兼容 S3 接口。它不收出站流量费，**存储和操作请求仍有计费规则**，免费额度放在文末一起说。

### 建桶并连接图片域名

1. 进入 Cloudflare **Storage & databases → R2**，首次使用按提示开通订阅、设置付款信息，再点 **Create bucket**；
2. 设置桶名，我用 `jiang-ran1130`。名字为 3–63 个小写字母、数字或短横线，不能以短横线开头或结尾；
3. Location 选 **Automatic**，存储类别选 **Standard**，点击 **Create bucket** 完成创建；
4. 在桶列表点进 `jiang-ran1130`，进入 **Settings → Custom Domains → Add**，填写 `img.han1130.top`（换成自己域名下的子域名），按向导确认 **Connect Domain**。

域名和桶须在同一个 Cloudflare 账户下。平台会创建所需 DNS 记录，等待 **Active** 即可，保留生成的配置，不要套用上一节 Vercel 的灰云设置。

正式博客使用自定义域名，可以接入 Cloudflare 缓存；`r2.dev` 是有限流的开发地址，不适合生产使用，也不需要为了自定义域名另外开启它。连接后桶内对象可公开访问，私人文件另放，见[R2 公开访问说明](https://developers.cloudflare.com/r2/buckets/public-buckets/)。

### 创建上传凭据

PicList 通过 S3 接口上传，需要 R2 生成的访问密钥：

1. 回 R2 概览，打开 **Manage R2 API Tokens**，创建令牌；
2. 权限选 **Object Read & Write**，范围只选目标桶 `jiang-ran1130`；
3. 保存生成的 **Access Key ID**、**Secret Access Key** 和实际 **S3 endpoint**。普通配置的端点形如 `https://<账户ID>.r2.cloudflarestorage.com`。

具体入口以[R2 认证文档](https://developers.cloudflare.com/r2/api/tokens/)为准。不要把普通 Cloudflare API Token 当成 S3 访问密钥。

> **Secret Access Key 只显示一次。** 及时保存到密码管理器；遗失后重新生成并更新客户端，泄露后撤销旧令牌。密钥和含密钥的配置文件别提交到仓库。

## 五、用 PicList 上传并验证

[PicList](https://github.com/Kuingsmile/PicList/releases) 内置 AWS S3 图床，安装后新增对应配置。字段名可能随版本变化，下面按用途对照：


| 字段                      | 填什么                                      | 说明                                           |
| ------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Access Key ID             | R2 生成的 Access Key ID                     | 上传凭据                                       |
| Secret Access Key         | 对应的 Secret Access Key                    | 本地保存                                       |
| Bucket                    | `jiang-ran1130`                             | 桶名，不是域名                                 |
| Region                    | `auto`                                      | R2 使用的区域值                                |
| 接口地址 / endpoint       | `https://<账户ID>.r2.cloudflarestorage.com` | 复制实际端点，不另加桶路径                     |
| 上传路径 / uploadPath     | `img/`                                      | 可选的对象键前缀                               |
| 公开 URL 前缀 / urlPrefix | `https://img.han1130.top`                   | 用于生成文章中的图片链接                       |
| 对象 ACL                  | `auto`                                      | 当前版本省略 ACL 请求头，R2 不支持 S3 对象 ACL |

路径风格访问先保留默认。如果开启后公开链接多出桶名，而域名已对应桶根，再启用“URL 不加桶名前缀”，详细行为见[PicList 配置文档](https://piclist.cn/providers/s3)。

保存后将这套配置设为默认，回到 PicList 的**上传区**，确认当前图床是 **AWS S3** 且选中了刚保存的配置。点击选择文件或把一张小图拖入上传区；上传完成后，从结果或**相册**复制图片 URL，再检查两件事：

1. **上传是否成功**：R2 桶里能否找到文件，例如对象键 `img/photo.png`；
2. **读者能否访问**：在未登录 Cloudflare 的浏览器窗口打开 `https://img.han1130.top/img/photo.png`。

两步都通过，再把链接粘进文章：

```md
![截图](https://img.han1130.top/img/photo.png)
```

PicList 相册能找回上传记录，但不能恢复误删的云端图片，原图还是要另存一份。

## 六、出问题时按哪条链路查

### 博客域名或证书异常

先确认 Vercel 已添加域名，再检查 CNAME 目标、同名记录冲突和额外 TXT 验证。证书迟迟不签发时，检查代理状态、CAA 限制和验证路径，参考[Vercel 排障文档](https://vercel.com/docs/domains/troubleshooting)。

DNS 缓存按 TTL 刷新，无痕窗口也不保证绕过系统或递归 DNS 缓存。阿里云控制台保留旧记录是正常的，不代表公网仍使用它；持续出现 `SERVFAIL` 时，还应检查旧 DNSSEC / DS 配置。

### 上传失败

- **403 / Access Denied**：检查密钥是否配对、令牌是否有效，以及是否拥有目标桶的读写权限；
- **SignatureDoesNotMatch**：检查凭据有无多余空格、endpoint 和 Region 是否正确，并同步系统时间；
- **其他 400 错误**：先看具体错误码，不要全部当成签名问题。

### 上传成功，图片却打不开

先查域名是否 **Active**、公开访问是否启用，再查 URL 路径、大小写、重复桶名，以及 Access / WAF 等访问规则。

**上传权限和公开读取是两条链路。** 文章里用图片域名，不用需要签名的 S3 API 地址；给上传令牌加权限，通常解决不了匿名访问失败。

## 七、费用与后续维护


| 项目                 | 免费条件或费用                                                 |
| -------------------- | -------------------------------------------------------------- |
| Vercel               | Hobby 限个人非商业用途，并有资源额度                           |
| Cloudflare DNS / CDN | 使用 Free 套餐包含的功能                                       |
| R2 Standard          | 每月含 10 GB-month 存储、100 万次 A 类操作、1000 万次 B 类操作 |
| 域名                 | 按注册商收费，首年价和续费价分开看                             |

R2 超出免费额度后按量计费，Infrequent Access 不适用上述免费额度；Vercel 超出部分额度可能限制功能或站点。具体以[R2 价格页](https://developers.cloudflare.com/r2/pricing/)和[Vercel Hobby 说明](https://vercel.com/docs/plans/hobby)为准。

小博客有机会只花域名续费的钱，但仍要查看用量、定期备份图片。以后换图床，先迁移文件、保持路径一致，再绑定原图片域名并切换 DNS，旧文章就能继续使用原链接。只改 DNS，可不会把图片一起搬过去。
