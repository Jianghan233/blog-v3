---
title: 博客的托管和域名
description: 讲述关于Blog 搭建的故事，并写出个人经历。
date: 2026-05-23 20:47:03
updated: 2026-05-23 20:47:03
image: https://img.han1130.top/photo/e7267902f3495e35ddaeb4adb56811bb.png
categories: [技术]
tags: []
recommend: true
---
## 博客的托管和域名

### 如何让他人访问

上一回说到本地文件传输到GitHub，但这样也只是让自己看到为了，让别人也可以访问你的博客需要一个静态网站托管平台，最好是可以和GitHub建立连接的。

1. 访问 [Vercel 官网](https://vercel.com/)，并使用 GitHub 账号授权登录。
2. 进入控制台(Dashboard)后，点击右上角的 **Add New**，选择 **Project**。
3. 在左侧的 Import Git Repository 列表中，找到刚才 Fork 并推送了最新代码的 `blog-v3` 仓库
4. 剩下的就默认即可。

之后就有了一个免费的域名了可以让别人访问，不嫌弃的话可以接着用这个，如果想要一共有特殊意义，或者更好听的名字可以去**阿里云**或者**腾讯云**等平台（买域名要实名的提交一下身份证不会花太长时间，国内的备案挺麻烦的），我从阿里云买的，买了一共.cn（新人优惠首年15元，之后42左右）一个.top（一年14元左右)，想一个自己喜欢的然后点击查询，没有被占用就可以填写信息模板了（实名认证），估计等一天就可以购买了。

## 将域名托管给 [ Cloudflare](https://www.cloudflare-cn.com/personal/)

方便后续 Cloudflare R2 免费图床能绑定自己的域名,让自己的博客更加好看方便插入更多图片。

1. 把刚买的域名给[ Cloudflare](https://www.cloudflare-cn.com/personal/)，登入之后点击[Domains ](https://dash.cloudflare.com/d84f7b7d95812f3254be7850d313b3b4/domains/overview)，再点击[添加域](https://dash.cloudflare.com/d84f7b7d95812f3254be7850d313b3b4/add-site)链接域名就可以了，添加新鲜出炉的`han1130.top`点击继续,选择免费套餐。
2. 会出现**Cloudflare 名称服务器** 把下面的两个DNS`（xxx.xxx.cloudflare.com）`复制，打开阿里云[域名控制台](https://dc.console.aliyun.com/next/index?spm=5176.12818093_47.overview_recent.1.6e942cc9kj14Cm#/domain-list/all?type=)找到自己的域名，点击 **修改 DNS 服务器**，把阿里云默认的 DNS 删掉，填入 CF 刚才给的两个 NS 地址`（xxx.xxx.cloudflare.com）`。NS 修改后几分钟到几小时生效Cloudflare 激活成功后。域名状态会显示：Active
3. **创建子域名**（就是在你的现有的域名前加一个小名字，如:我加的是blog，我的子域名为blog.han1130.top）,进vercel，**Settings → Domains**，点击右上角**ADD EX...**,添加想要的子域名, 会有红色提示点击**了解更多**，会出现专属地址`（如1c1c1c1c1c1c.vercel-dns-011.com）`，再复制，回到[Cloudflare](https://www.cloudflare-cn.com/personal/)
4. 之后回到[Cloudflare](https://www.cloudflare-cn.com/personal/)找到自己的刚才的域名，点击**添加记录**，

   编辑类型：CNAME

   名称：       blog

   目标：       1c1c1c1c1c1c.vercel-dns-011.com

   就会得到一个子域名`blog.han1130`。

   *添加`blog.han1130`这条 CNAME 记录时，最右边那个代理状态（Proxy status）的橙色小云朵，需要点灰它，不然Cloudflare 代理可能导致 Vercel 域名验证失败或 SSL 配置异常*

## 图床搭建

简单说：

> 图床 = 专门存图片的服务器

你博客里的呈现的图片，实际上是：

> 浏览器会去某个服务器下载图片。

为什么不用本地图片？

* 部署麻烦每次：上传博客，构建网站，部署 Vercel，图片都会跟着一起上传。
* 仓库越来越大：GitHub 会变成越来越大，clone 很慢。
* 图片加载慢，Vercel：更适合网页。不适合大量图片 CDN。

### R2

因为：免费额度大，全球CDN，配 Cloudflare 很方便，基本不怕跑路

**在CF里面搜索R2，**

创建 Bucket：

> 可以理解成一个文件夹仓库

起一个名字就可以了，里面可以放图片等

点击你刚创建的桶。

进入 设置（Settings）

你会看到：

* 常规
* CORS
* 自定义域
* 公共访问

之类的。

找到 “自定义域”

点击：

> 连接域（Connect Domain）

输入子域名（随便输一个有意义的）：img.han1130.top

原因：后面方便换 CDN

输入后继续。

Cloudflare 会自动创建 DNS

它会自动帮你创建：你不用手动加。

然后在创建的界面的**账户详情**，点击**管理**，创建API，权限我选的第三个，指定桶（刚才创建的bucket名字），点击创建。

**截图保存，等一会要用到的**

**截图保存，等一会要用到的**

## 安装 PicList

去官网下载：[PicList github](https://github.com/Kuingsmile/PicList?utm_source=chatgpt.com)

**图库选AWS S3 ，在配置界面填写（Cloudflare R2）**

请按以下内容**逐个字段填写**：

### 必填字段：

1. **设定 AccessKeyId** → 填你刚才在 Cloudflare 创建的 **Access Key ID**
2. **设定 SecretAccessKey** → 填你刚才创建的 **Secret Access Key**
3. **设定 Bucket** → jiang-ran1130
4. **设定上传路径**（可选，但推荐） → img/ （或者 blog/、uploads/ 等，记得最后加 /）
5. **设定 Region** → auto
6. **设定自定义节点**（最重要！） → 刚才的创建桶的时候下面API有一个链接（内容是到创建桶前的链接）
7. **设定自定义域名** → https://img.han1130.top

上传试试吧  （AvA）
