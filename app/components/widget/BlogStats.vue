<script setup lang="ts">
import { UtilDate } from '#components'

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()

// 响应头不正确时，stats.value 可能会是字符串，首次属性访问可能为 undefined
const { data: stats } = useFetch('/api/stats')

const yearlyTip = computed(() => Object
	.entries(stats.value?.annual || {})
	.reverse()
	.map(([year, item]) => `${year}年：${item.posts}篇，${formatNumber(item.words)}字`)
	.join('\n') || '数据获取失败',
)

// 访客统计由客户端插件记录访问后填充，SSR 首屏显示 '--'
const { stats: visitorStats } = useVisitorStats()

const blogStats = [{
	label: '运营时长',
	value: timeElapse(appConfig.timeEstablished),
	tip: `博客于${appConfig.timeEstablished}上线`,
}, {
	label: '上次更新',
	value: () => h(UtilDate, {
		date: runtimeConfig.public.buildTime,
		relative: true,
		tipPrefix: '构建于',
	}),
}, {
	label: '总字数',
	value: computed(() => formatNumber(stats.value?.total?.words) || '--'),
	tip: yearlyTip,
}, {
	label: '总访问量',
	value: computed(() => visitorStats.value ? formatNumber(visitorStats.value.total) : '--'),
	tip: '历史唯一访客数（UV 去重）',
}, {
	label: '今日访问',
	value: computed(() => visitorStats.value?.today ?? '--'),
	tip: '今日唯一访客数',
}, {
	label: '当前在线',
	value: computed(() => visitorStats.value?.online ?? '--'),
	tip: '5 分钟内活跃的访客',
}]
</script>

<template>
<BlogWidget card title="博客统计">
	<ZDlGroup :items="blogStats" size="small" />
</BlogWidget>
</template>
