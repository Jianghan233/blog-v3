import type { FeedGroup } from '../app/types/feed'
// 友链检测 CLI 需要使用显式导入和相对路径
import { myFeed } from '../blog.config'
// eslint-disable-next-line unused-imports/no-unused-imports
import { getFavicon, getGithubAvatar, getGithubIcon, getOciqGroupAvatar, getOicqAvatar, OicqAvatarSize } from './utils/img'

export default [
	// #region Clarity
	{
		name: '大学的同学们',
		desc: 'ctf相关的博客和工具，欢迎常来串门',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			myFeed,
			{
				author: '2_haowen_V',
				sitenick: '2_haowen_V',
				title: '2_haowen_V',
				desc: '一个喜欢研究网络的人',
				link: 'https://hehaowen.com.cn/',
				feed: 'https:',
				icon: 'https://cravatar.cn/avatar',
				avatar: 'https://',
				archs: ['Nuxt', 'Netlify'],
				date: '2025-05-21',
				comment: '带我入门CTF的大手子。',
			},

		],
	},
	// #endregion
	// #region 网上邻居 since 2024
	{
		name: '大学的同学们',
		desc: '欢迎常来串门。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '1111',
				sitenick: '111',
				title: '111',
				desc: '介绍',
				link: 'https://blog',
				feed: 'https://blog',
				icon: 'zi:SolarRewindBackBoldDuotone',
				avatar: 'zi:SolarRewindBackBoldDuotone',
				archs: ['Nuxt', 'Netlify'],
				date: '2023-12-23',
				comment: '这是一个测试友链，看看能不能显示在清晰体验里。',
			},
			/* ========从此处新增友链======== */
		],
	},
	// #endregion
	// #region XUPTers
	{
		name: 'X',
		desc: '大学的校友们。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '1111',
				sitenick: '111',
				title: '111',
				desc: '介绍',
				link: 'https://blog',
				feed: 'https://blog',
				icon: 'zi:SolarRewindBackBoldDuotone',
				avatar: 'zi:SolarRewindBackBoldDuotone',
				archs: ['Nuxt', 'Netlify'],
				date: '2023-12-23',
				comment: '这是一个测试友链，看看能不能显示在清晰体验里。',
			},

		],
	},
	// #endregion
	// #region 知识分享
	{
		name: '知识分享',
		desc: '“AI时代”创作分享/知识内容收集。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '1111',
				sitenick: '111',
				title: '111',
				desc: '介绍',
				link: 'https://blog',
				feed: 'https://blog',
				icon: 'zi:SolarRewindBackBoldDuotone',
				avatar: 'zi:SolarRewindBackBoldDuotone',
				archs: ['Nuxt', 'Netlify'],
				date: '2023-12-23',
				comment: '这是一个测试友链，看看能不能显示在清晰体验里。',
			},

		],
	},
	// #endregion
	// #region 漫游
	{
		name: '漫游',
		desc: '网上冲浪时发现的精彩内容与常读订阅，与君共享。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '1111',
				sitenick: '111',
				title: '111',
				desc: '介绍',
				link: 'https://blog',
				feed: 'https://blog',
				icon: 'zi:SolarRewindBackBoldDuotone',
				avatar: 'zi:SolarRewindBackBoldDuotone',
				archs: ['Nuxt', 'Netlify'],
				date: '2023-12-23',
				comment: '这是一个测试友链，看看能不能显示在清晰体验里。',
			},

		],
	},
	// #endregion
] satisfies FeedGroup[]
