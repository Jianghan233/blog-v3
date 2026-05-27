import type { Nav, NavItem } from '~/types/nav'
import { pascalCase } from 'es-toolkit/string'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '~~/blog.config'
import { name, version } from '~~/package.json'

// 图标查询：https://yesicon.app/tabler
// 图标插件：https://marketplace.visualstudio.com/items?itemName=antfu.iconify

// @keep-sorted
export default defineAppConfig({
	// 将 blog.config 中的配置项复制到 appConfig，方便调用
	...blogConfig,

	component: {
		alert: {
			/** 默认使用卡片风格还是扁平风格 */
			defaultStyle: 'card' as 'card' | 'flat',
		},

		codeblock: {
			/** 代码块触发折叠的行数 */
			triggerRows: 32,
			/** 代码块折叠后的行数 */
			collapsedRows: 16,
			/** 启用代码块缩进导航会关闭空格渲染 */
			enableIndentGuide: true,
			/** 代码块缩进导航(Indent Guige)竖线匹配空格数 */
			indent: 4,
			/** tab渲染宽度 */
			tabSize: 3,
		},

		/** 文章开头摘要 */
		excerpt: {
			animation: true,
			caret: '_',
		},

		/** 精选文章 Slide */
		slide: {
			/** 适合封面图无字时启用 */
			showTitle: true,
		},

		stats: {
			/** 归档页面每年标题对应的年龄 */
			birthYear: 2005,
			/** blog-stats widget 的预置文本 */
			wordCount: '约10万',
		},
	},

	// @keep-sorted
	footer: {
		/** 页脚版权信息，支持 <br> 换行等 HTML 标签 */
		copyright: `© ${Temporal.Now.plainDateISO().year.toString()} ${blogConfig.author.name}`,
		/** 侧边栏底部图标导航 */
		iconNav: [
			{ icon: 'tabler:home', text: '个人主页', url: blogConfig.author.homepage },
			{ icon: 'ri:qq-line', text: '交流群: 能力不够呢', url: 'https://jq.qq.com/' },
			{ icon: 'tabler:brand-github', text: 'GitHub: Jianghan233', url: 'https://github.com/Jianghan233' },
			{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
			{ icon: 'ri:subway-line', text: '开往 - 博客下一站', url: 'https://www.travellings.cn' },
		] satisfies NavItem[],
		/** 页脚站点地图 */
		nav: [
			{
				title: '探索',
				items: [
					{ icon: 'tabler:rss', text: 'Atom订阅', url: '/atom.xml' },
					{ icon: 'ri:subway-line', text: '开往', url: 'https://www.travellings.cn' },
				],
			},
			{
				title: '社交',
				items: [
					{ icon: 'tabler:brand-github', text: 'Jianghan233', url: 'https://github.com/Jianghan233' },
					{ icon: 'ri:qq-line', text: '群: ', url: 'https://jq.qq.com/' },
					{ icon: 'tabler:mail', text: blogConfig.author.email, url: `mailto:${blogConfig.author.email}` },
				],
			},
			{
				title: '信息',
				items: [
					{ icon: 'simple-icons:nuxt', text: `主题: ${pascalCase(name)} ${version}`, url: 'https://github.com/Jianghan233/blog-v3' },
					{ icon: 'tabler:color-swatch', text: '主题和组件文档', url: '/theme' },
					{ icon: 'tabler:certificate', text: '陕ICP备1号', url: 'https://beian.miit.gov.cn/' },
				],
			},
		] satisfies Nav,
	},

	/** 左侧栏顶部 Logo */
	header: {
		logo: 'https://weavatar.com/avatar/47c0f2e82b76d9b10eb3023df9e02e4e3fdbeaf5b74b842063f207971e7fbe7b?s=160',
		/** 展示标题文本，否则展示纯 Logo */
		showTitle: true,
		subtitle: blogConfig.subtitle,
		emojiTail: ['📄', '🦌', '🙌', '🐟', '🏖️'],
	},

	/** 友链页面 */
	link: {
		/** 无订阅源展示静音图标 */
		remindNoFeed: true,
		/** 友链分组内随机排序 */
		randomInGroup: true,
	},

	/** 左侧栏导航 */
	nav: [
		{
			title: '',
			items: [
				{ icon: 'tabler:files', text: '文章', url: '/' },
				{ icon: 'tabler:link', text: '友链', url: '/link' },
				{ icon: 'tabler:archive', text: '归档', url: '/archive' },
			],
		},
	] satisfies Nav,

	pagination: {
		perPage: 10,
		/** 默认排序方式，需要是 this.article.order 中的键名 */
		sortOrder: 'date' as keyof typeof blogConfig.article.order,
		/** 允许（普通/预览/归档）文章列表正序，开启后排序方式左侧图标可切换顺序 */
		allowAscending: false,
	},

	themes: {
		light: {
			icon: 'tabler:sun',
			tip: '浅色模式',
		},
		system: {
			icon: 'tabler:device-desktop',
			tip: '跟随系统',
		},
		dark: {
			icon: 'tabler:moon',
			tip: '深色模式',
		},
	},

	/** 音乐播放器配置 */
	music: {
		/** 播放列表 */
		audio: [
			{
				name: '平面交叉',
				artist: '未知艺术家',
				url: 'https://assets.han1130.top/%E5%B9%B3%E8%A1%8C%E4%BA%A4%E5%8F%89.mp3',
			},
			{
				name: 'Lemon',
				artist: '米津玄師',
				url: 'https://music.163.com/song/media/outer/url?id=1317756086.mp3',
				cover: 'https://p2.music.126.net/gG5p6HjR84Jb8K8E7XQ29g==/109951164272745697.jpg',
				lrc: '[00:00.00]Lemon - 米津玄師\n[00:05.00]夢ならばどれほどよかったでしょう\n[00:11.00]未だにあなたのことを夢に見る\n[00:17.00]忘れた物を取りに帰るように\n[00:23.00]古びた思い出の埃を払う\n[00:29.00]戻らない時だけが何故か輝いて\n[00:35.00]あなたの選んだ道を歩く',
			},
			{
				name: '起风了',
				artist: '买辣椒也用券',
				url: 'https://music.163.com/song/media/outer/url?id=544652168.mp3',
				cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/109951163245728281.jpg',
			},
			{
				name: '平凡之路',
				artist: '朴树',
				url: 'https://music.163.com/song/media/outer/url?id=26937680.mp3',
				cover: 'https://p2.music.126.net/5LdG3GLTv6Kc7W0V47Z38g==/109951163141531212.jpg',
			},
		],
	},
})
