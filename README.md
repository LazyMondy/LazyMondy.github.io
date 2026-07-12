# LazyMondy · 慢调周记

> 一个不赶时间的角落,记录从容生活中的灵感、思考与慢节奏美学。
> 这里没有 deadline,只有星期绕着我转的悠闲。

线上访问:[https://lazymondy.github.io](https://lazymondy.github.io)

---

## 站点概览

- **博客框架**:Hexo 8.x
- **主题**:Butterfly 5.x
- **构建方式**:GitHub Actions 自动构建并部署到 GitHub Pages
- **建站时间**:2026 年 7 月 10 日 22:57 起

## 特色功能

- **原创短诗周记**:每周一篇图文并茂的生活记录
- **多主题色切换**:暖木质大地 / 自然绿 / 海港蓝 / 黄昏橘四种配色
- **3D 标签云**:Fibonacci 球形分布,鼠标交互暂停旋转
- **鼠标特效**:光珠拖尾 + 点击烟花爆炸粒子
- **起始页 Welcome Gate**:全屏欢迎页,点击"开启"进入博客
- **时光页面**:建站计时 + 节日倒计时
- **留言弹幕**:轻量弹幕留言区
- **本周签引言块**:文章末尾原创诗句引言

## 目录结构

```
source/
├── _posts/              # 博客文章(每篇含独立 images/ 子目录)
├── about/               # 关于页
├── categories/          # 分类页
├── custom/               # 自定义脚本与样式
│   ├── cursor-effects.js       # 鼠标拖尾 + 烟花特效
│   ├── tag-cloud-3d.js          # 3D 标签云
│   ├── welcome-gate.js          # 起始页
│   ├── timeline.js              # 时光页面计时
│   ├── theme-switch.js          # 主题色切换
│   ├── danmaku.js               # 弹幕留言
│   └── week-sign.js             # 本周签引言
├── essays/              # 闲言页
├── images/              # 封面与公共图片
├── links/              # 友链页
├── message/            # 留言页
├── tags/               # 标签页
└── timeline/           # 时光页(建站计时 + 节日倒计时)
```

## 本地运行

需要预先安装 [Node.js](https://nodejs.org/) 18+。

```bash
# 安装依赖
npm install

# 本地预览(http://localhost:4000/)
npx hexo server

# 生成静态文件到 public/
npx hexo generate
```

## 部署说明

仓库已配置 GitHub Actions(见 `.github/workflows/gh-pages.yml`):

1. 向 `main` 分支推送代码
2. Actions 自动执行 `npm install` + `npm run build`
3. 将生成的 `public/` 推送到 `gh-pages` 分支
4. GitHub Pages 自动发布到 `https://lazymondy.github.io`

无需手动构建,只需提交源码。

## 写作规范

新文章请遵循 `规则流程/博客写作与目录规范.md`,要点:

- 每篇文章配独立封面缩略图(`source/images/cover-xxx.svg`)
- Front Matter 必须包含 `cover` 字段
- 文章内 SVG 插图放在文章同名子目录的 `images/` 下
- 仅首篇文章 LazyMondy 使用 `sticky` 置顶,其他文章不加
- 内容为原创短诗/随笔,不引用他人诗句

## 联系

- 邮箱:2713247438@qq.com
- 站点:[https://lazymondy.github.io](https://lazymondy.github.io)

## 许可

本项目采用 [MIT License](LICENSE)。