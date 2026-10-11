import type { VisitorStats } from '~~/server/utils/visitorStats'

const VISITOR_ID_KEY = 'visitor-id'
/** 会话内已记录标记：每浏览器会话仅 POST 一次，重复访问改用 GET 同步数据 */
const VISITED_SESSION_KEY = 'visitor-recorded'

/** 访客统计数据：由客户端插件记录访问后填充，供“博客统计”widget 展示 */
export function useVisitorStats() {
	const stats = useState<VisitorStats | null>('visitor-stats', () => null)

	/** 读取（或首次生成）访客唯一 ID，持久保存在 localStorage */
	function getVisitorId(): string {
		let id = localStorage.getItem(VISITOR_ID_KEY)
		if (!id) {
			id = crypto.randomUUID()
			localStorage.setItem(VISITOR_ID_KEY, id)
		}
		return id
	}

	async function recordVisit() {
		if (import.meta.server)
			return
		const recorded = sessionStorage.getItem(VISITED_SESSION_KEY)
		const visitorId = getVisitorId()
		try {
			stats.value = await $fetch<VisitorStats>('/api/visitors', {
				method: recorded ? 'GET' : 'POST',
				headers: { 'x-visitor-id': visitorId },
			})
			sessionStorage.setItem(VISITED_SESSION_KEY, '1')
		}
		catch (e) {
			console.warn('[visitorStats] 记录访问失败', e)
		}
	}

	return { stats, recordVisit }
}