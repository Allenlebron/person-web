# 内容配置边界与硬编码页面说明

本文档说明 `person-web` 当前哪些内容可以通过管理后台修改，哪些内容必须修改代码并重新部署。

适用基线：`main`，截至 2026-06-11。

## 1. 判断原则

站点内容目前来自四类数据源：

| 数据源              | 修改方式                                                | 是否需要重新部署                   |
| ------------------- | ------------------------------------------------------- | ---------------------------------- |
| D1 站点设置         | `/admin/settings`、`/admin/comments` 或 `PUT /api/site` | 否                                 |
| D1 内容记录         | 文章、专栏、标签、评论等后台功能或 API                  | 否                                 |
| 代码文案和页面结构  | 修改路由、组件、消息文件或文档文件                      | 是                                 |
| Cloudflare 环境配置 | Worker 变量、Secret、D1/KV/R2 绑定                      | 通常需要重新部署或更新 Worker 配置 |

简单判断：

- 经常变化的文章、专栏、评论和基础站点资料，优先由后台管理。
- 首页营销内容、关于页主体介绍、Demo、帮助文档、页面布局和模板品牌信息，目前由代码管理。
- 修改代码内容后，需要提交到 `main`，等待 GitHub Actions 重新部署。

## 2. 后台可修改内容

### 2.1 站点设置

入口：`/admin/settings`

实现文件：

- `apps/web/src/routes/_auth/admin/settings.tsx`
- `apps/web/src/routes/api/site.ts`
- `apps/web/src/lib/cms-d1-assets.ts`
- `apps/web/src/lib/cms-d1-shared.ts`

| 后台字段         | 主要影响范围                                    | 注意事项                                           |
| ---------------- | ----------------------------------------------- | -------------------------------------------------- |
| 站点名称         | 页头品牌、页脚、文档页品牌、后台品牌、RSS       | 全局默认 HTML 标题仍存在代码级回退，见第 4 节      |
| 站点描述         | 页脚、RSS、部分元信息                           | 首页主体文案不读取该字段                           |
| 站点 URL         | canonical、RSS、robots、sitemap                 | 正式换域名时还需要同步 Worker 配置和 DNS           |
| 作者名称         | 关于页资料卡、新创建文章的默认作者              | 不会批量修改已有文章作者                           |
| 作者简介         | 关于页资料卡和关于页 description                | 当前语言保存时会同步对应本地化值                   |
| 头像 URL         | 关于页资料卡、文章结构化数据中的发布者 Logo     | 图片需先上传到资源库或使用可访问 URL               |
| 默认 OG 图片     | 没有封面图的文章分享图                          | 根路由默认 OG 图仍是代码固定值                     |
| 社交链接         | 桌面页头 GitHub 入口、页脚链接、文档页 RSS 入口 | GitHub 入口通过链接名称或 `github.com` 地址识别    |
| 导航链接         | 桌面端公开页头导航                              | 移动端底部导航仍是代码固定项                       |
| 主语言           | RSS 内容语言、部分默认语言行为                  | 中英文界面文案本身仍在代码消息文件中               |
| 主题预设         | 公开站、后台、登录页样式                        | 可选项由代码限定                                   |
| 首页布局         | 后台不再展示该字段；底层保留 `layoutPreset` 值  | 当前首页组件固定为 `ShelfHome`，还没有不同布局组件 |
| RSS 开关         | `/rss.xml` 和文档页 RSS 入口                    | 路由实现仍由代码管理                               |
| 搜索引擎索引开关 | `robots.txt`、文章 robots 元信息                | sitemap 固定页面列表由代码管理                     |
| 邮箱功能开关     | 验证邮件、博客更新、手动公告                    | 还依赖 Cloudflare Email 或 Resend 环境配置         |

站点名称、描述和作者简介支持当前语言本地化。基础值和本地化值都存储在 D1 的 `site_settings` 记录中。

### 2.2 评论设置

入口：`/admin/comments`

可修改：

- 全站评论开关
- 评论是否需要人工审核
- 屏蔽关键词和自动屏蔽
- AI 评论审核开关和审核规则
- 评论审核状态

实现文件：

- `apps/web/src/routes/_auth/admin/comments.tsx`
- `apps/web/src/routes/api/comments.ts`
- `apps/web/src/lib/cms-d1-comments.ts`

### 2.3 文章、专栏、标签和资源

| 内容       | 后台入口                 | 说明                                                                           |
| ---------- | ------------------------ | ------------------------------------------------------------------------------ |
| 文章       | `/admin/posts`           | 标题、摘要、正文、封面、发布时间、状态、专栏、标签、精选、置顶、评论开关可修改 |
| 专栏       | `/admin/series`          | 名称、Slug、描述、排序可修改                                                   |
| 标签       | 文章编辑器中的标签输入框 | 当前没有独立标签管理页；标签随文章保存时创建或复用                             |
| 图片和附件 | `/admin/assets`          | 文件存储在 R2，元数据存储在 D1                                                 |
| 评论       | `/admin/comments`        | 审核、垃圾标记、删除                                                           |

文章、专栏和标签页面的内容来自 D1，不需要修改代码。

### 2.4 账号资料与作者资料不是同一份数据

入口 `/app` 中的“显示名称”属于登录账号资料：

- 影响账号中心显示。
- 影响该账号以后发表的评论名称。
- 不会修改站点作者名称、作者简介或关于页主体内容。

站点作者资料需要在 `/admin/settings` 修改：

- 作者名称
- 作者简介
- 头像 URL

对应实现：

- 账号资料：`apps/web/src/routes/api/account/profile.ts`
- 站点作者资料：`apps/web/src/routes/_auth/admin/settings.tsx`

## 3. 按公开页面梳理

### 3.1 首页 `/`

文件：`apps/web/src/routes/index.tsx`

后台可修改：

- 页头和页脚中的站点名称、描述、导航、社交链接
- 主题预设
- 首页展示的最新文章内容

代码硬编码：

- Hero 标题、说明和按钮文案
- “免费边界”“内容所有权”“发布流程”“技术栈”等全部营销区块
- Cloudflare 免费额度说明
- 作者介绍和站内入口
- 首页区块顺序、卡片结构、图标和配色

主要修改入口：

- 页面结构：`HomePage`、`ShelfHome` 等组件
- 中英文内容：`getHomeCopy`
- 联系邮箱：`myzwilpan@gmail.com`

### 3.2 关于页 `/about`

文件：`apps/web/src/routes/about.tsx`

后台可修改：

- 资料卡中的作者名称
- 资料卡中的作者简介
- 资料卡头像
- 页面 title 和 description 中使用的作者资料

代码硬编码：

- 页面主标题和主体介绍
- 方法论区块
- 推荐路径卡片
- “阅读文章”“联系我”等按钮链接
- 联系邮箱 `myzwilpan@gmail.com`

主要修改入口：

- 页面结构和固定链接：`AboutPage`
- 中英文主体文案：`getAboutCopy`

当前实现只让资料卡读取后台作者资料。PRD 中“关于页后台可编辑、支持 Markdown / HTML”的完整能力尚未实现。

### 3.3 Demo 页 `/demo`

文件：`apps/web/src/routes/demo.tsx`

后台可修改：

- 页头、页脚和主题预设等共享站点设置

代码硬编码：

- Demo 页面全部说明文案
- 所有演示文章、作者、布局示例和卡片
- Demo 图片引用

主要修改入口：

- 中英文内容和演示数据：`getDemoCopy`
- 演示图片：`apps/web/public/demo/`

### 3.4 博客列表 `/blog`

文件：`apps/web/src/routes/blog/index.tsx`

后台可修改：

- 文章内容和公开状态
- 标签
- 专栏

代码硬编码：

- 页面标题、说明、筛选器和分页等界面文案
- 每页显示数量 `BLOG_PAGE_SIZE`
- 标签和专栏筛选器的最多展示数量

界面文案主要来自：

- `apps/web/messages/zh.json`
- `apps/web/messages/en.json`

### 3.5 文章详情 `/blog/:slug`

文件：`apps/web/src/routes/blog/$slug.tsx`

后台可修改：

- 标题、摘要、正文、封面、发布时间、标签、专栏
- 文章级评论开关
- 评论内容和审核状态
- 站点作者名称、头像、默认 OG 图片和索引开关

代码硬编码：

- 目录、相关文章、评论区等界面结构
- 通用界面文案
- JSON-LD 结构和 SEO 拼装规则

注意：修改站点作者名称不会追溯更新已有文章记录中的作者名称。

当前文章编辑器没有提交 SEO 标题和 SEO 描述。底层文章数据和 API 支持这些字段，但要从后台编辑，需要补充表单和提交逻辑。

### 3.6 专栏页 `/series`、`/series/:slug`

文件：

- `apps/web/src/routes/series/index.tsx`
- `apps/web/src/routes/series/$slug.tsx`

后台可修改：

- 专栏名称、描述、Slug、排序
- 专栏下的文章

代码硬编码：

- 页面布局
- “专栏”“文章数量”等通用界面文案

### 3.7 标签页 `/tags`、`/tags/:slug`

文件：

- `apps/web/src/routes/tags/index.tsx`
- `apps/web/src/routes/tags/$slug.tsx`

后台可修改：

- 通过文章编辑器添加或复用标签
- 标签与文章的关联

代码硬编码：

- 页面布局
- “标签”“文章数量”等通用界面文案

当前没有独立标签管理后台，也没有独立标签 API。需要直接修改标签描述或清理标签时，应操作 D1，或新增标签管理功能。

### 3.8 文档页 `/docs`、`/zh/docs`

内容目录：`apps/web/content/docs/`

文档不是 D1 文章，不能通过管理后台修改。每个英文文档通常对应一个 `.zh.md` 中文版本。

代码硬编码：

- 文档正文和侧边栏顺序
- 文档 GitHub 仓库链接
- 文档布局

主要修改入口：

- 正文：`apps/web/content/docs/*.md`、`apps/web/content/docs/*.zh.md`
- 导航顺序：`apps/web/content/docs/meta.json`、`meta.zh.json`
- 布局和 GitHub 链接：`apps/web/src/lib/docs-layout.tsx`

### 3.9 页头、页脚和移动端导航

文件：`apps/web/src/components/site-shell.tsx`

后台可修改：

- 桌面页头站点名称
- 桌面页头导航
- GitHub 社交链接
- 页脚站点名称、描述和社交链接

代码硬编码：

- 页脚版权年份格式
- 默认导航回退项
- 移动端底部导航的首页、Demo、文档、文章和账号入口

因此，修改后台导航链接只会完整影响桌面页头，不会自动重建移动端底部导航。

### 3.10 RSS、robots 和 sitemap

| 路由                 | 动态部分                                    | 代码固定部分                    |
| -------------------- | ------------------------------------------- | ------------------------------- |
| `/rss.xml`           | 站点名称、描述、URL、文章、主语言、RSS 开关 | XML 模板                        |
| `/feed.xml`          | 无                                          | 固定 301 跳转到 `/rss.xml`      |
| `/robots.txt`        | URL、索引开关                               | robots 模板和 `/admin` 屏蔽规则 |
| `/sitemap.xml`       | 文章、标签、专栏、文档和站点 URL            | 固定页面列表                    |
| `/sitemap-posts.xml` | 文章和站点 URL                              | XML 模板                        |

主要文件：

- `apps/web/src/routes/rss[.]xml.ts`
- `apps/web/src/routes/robots[.]txt.ts`
- `apps/web/src/lib/sitemap.ts`

## 4. 全局代码配置与已知限制

### 4.1 默认站点数据

文件：`packages/core/src/demo-data.ts`

这里的 `siteSettings` 是代码级默认值和回退值。正常生产环境优先读取 D1，但以下情况仍会使用或依赖代码默认值：

- D1 站点设置读取失败或还没有初始化。
- 根路由默认元信息。
- 某些服务端默认语言判断。

不要把日常站点资料只改在该文件中。正常修改应优先使用后台，代码默认值仅用于回退和初始化一致性。

### 4.2 根路由 SEO、图标和 PWA 资源

文件：

- `apps/web/src/routes/__root.tsx`
- `apps/web/public/`

当前代码固定：

- 根路由默认 OG 图片 `/og-default.svg`
- favicon、Apple Touch Icon、PWA 图标和 manifest 路径
- theme color 和部分 PWA 元信息

`__root.tsx` 的默认标题和描述读取代码级默认站点数据，不直接读取 D1。具体文章页和关于页会设置自己的元信息，但如果要让所有页面的默认 SEO 都实时跟随后台，需要继续改造根路由数据加载。

### 4.3 通用界面文案

Paraglide 消息源文件：

- `apps/web/messages/zh.json`
- `apps/web/messages/en.json`

用于博客列表、文章页、标签页、专栏页、登录页和后台等通用界面文案。

不要直接修改以下生成文件：

- `apps/web/src/paraglide/`
- `apps/web/src/routeTree.gen.ts`
- `apps/web/dist/`

构建过程会根据源文件重新生成它们。

### 4.4 PRD 与当前实现差异

`docs/prd.md` 描述的是目标能力，不完全等于当前实现。当前主要差异：

- 关于页不是完整后台可编辑页面，只有作者资料卡读取站点设置。
- 后台没有“页脚内容”独立字段。
- 后台没有 Logo、自定义 CSS、自定义 head 注入字段。
- 后台没有独立标签管理页。
- 根路由默认 SEO 和默认 OG 图没有完全跟随 D1 设置。
- 底层保留首页布局值，但当前没有切换不同首页组件，后台已隐藏该无效选项。
- 文章编辑器显示了 SEO 相关消息定义，但当前表单没有提供和提交 SEO 字段。

修改功能前应以当前代码和本文档为准，同时评估是否需要更新 PRD。

## 5. 修改代码内容的标准流程

### 5.1 修改前

1. 确认内容是否已经可以通过后台修改。
2. 确认是否需要同时修改中文和英文。
3. 确认图片应放到 R2 资源库，还是作为代码静态资源放到 `apps/web/public/`。

### 5.2 修改后验证

```bash
pnpm test
pnpm check
pnpm build:web
```

重点人工检查：

- 中文和英文页面
- 桌面端页头与移动端底部导航
- 页面 title、description、OG 元信息
- 公开页面链接和图片
- 浏览器控制台错误

### 5.3 发布

```bash
git add <修改文件>
git commit -m "docs: update site content"
git push origin main
```

推送 `main` 后，GitHub Actions 会部署到 Cloudflare Worker。代码硬编码内容只有部署成功后才会在线上生效。

## 6. 后续改造成后台配置的优先级建议

如果希望减少后续代码修改，建议按以下顺序扩展后台：

1. 关于页主体内容、联系邮箱和外部链接。
2. 页脚版权和创作者信息。
3. 首页 Hero 和主要 CTA。
4. 移动端底部导航。
5. 根路由默认 SEO、OG 图和 PWA 品牌资料。
6. 独立标签管理页。
7. 首页其他营销区块。

这些配置应继续存入 D1 的站点设置或新增页面内容表，避免把高频内容配置放入 Worker 环境变量。
