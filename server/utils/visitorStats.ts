import { createHash } from 'node:crypto'
import { Redis } from '@upstash/redis'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '~~/blog.config'

export interface VisitorStats {
	/** 总访问量：历史唯一访客数（UV 去重） */
	total: number
	/** 今日访问：当天唯一访客数 */
	today: number
	/** 当前在线：5 分钟内活跃的访客数 */
	online: number
}

/** 在线判定窗口：5 分钟 */
const ONLINE_WINDOW = 5 * 60 * 1000
/** 今日 key 过期时间：48 小时（跨天自动分 key，无需重置逻辑） */
const TODAY_KEYS_TTL = 48 * 60 * 60

const keys = {
	all: 'visit:all',
	today: (date: string) => `visit:uids:${date}`,
	online: 'visit:online',
}

/** 当前日期（按博客时区），格式 YYYY-MM-DD */
function todayString() {
	return Temporal.Now.zonedDateTimeISO(blogConfig.timeZone).toPlainDate().toString()
}

// ---- Upstash Redis（生产方案，原子操作避免并发丢计数） ----

/**
 * 创建 Redis 客户端：
 * 优先读取 Upstash 官方变量名（UPSTASH_REDIS_REST_URL/TOKEN），
 * 回退到 Vercel Marketplace 集成注入的变量名（KV_REST_API_URL/TOKEN）
 */
function createRedisClient() {
	const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
	const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
	if (url && token)
		return new Redis({ url, token })
	return null
}

const redis = createRedisClient()

if (!redis && import.meta.dev)
	console.warn('[visitorStats] 未配置 Upstash Redis 环境变量（UPSTASH_* 或 KV_*），访客统计使用内存存储（仅开发环境可用，数据不持久化）')

async function recordVisitRedis(uid: string): Promise<VisitorStats> {
	const date = todayString()
	const now = Date.now()
	const todayKey = keys.today(date)

	const pipeline = redis!.pipeline()
	pipeline.sadd(keys.all, uid)
	pipeline.sadd(todayKey, uid)
	pipeline.expire(todayKey, TODAY_KEYS_TTL)
	pipeline.zadd(keys.online, { score: now, member: uid })
	pipeline.zremrangebyscore(keys.online, '-inf', now - ONLINE_WINDOW)
	await pipeline.exec()

	return getVisitorStatsRedis(date)
}

async function getVisitorStatsRedis(date: string): Promise<VisitorStats> {
	const [total, today, online] = await Promise.all([
		redis!.scard(keys.all),
		redis!.scard(keys.today(date)),
		redis!.zcard(keys.online),
	])
	return { total: total ?? 0, today: today ?? 0, online: online ?? 0 }
}

// ---- 内存存储（仅开发环境降级方案） ----

const memoryStore = {
	all: new Set<string>(),
	today: new Map<string, Set<string>>(),
	online: new Map<string, number>(),
}

function recordVisitMemory(uid: string): VisitorStats {
	const date = todayString()
	const now = Date.now()

	memoryStore.all.add(uid)
	let todaySet = memoryStore.today.get(date)
	if (!todaySet) {
		todaySet = new Set()
		memoryStore.today.set(date, todaySet)
	}
	todaySet.add(uid)
	// 清理非今日的日期 key
	for (const key of memoryStore.today.keys()) {
		if (key !== date)
			memoryStore.today.delete(key)
	}
	// 清理 5 分钟未活跃的访客
	const cutoff = now - ONLINE_WINDOW
	for (const [member, lastVisit] of memoryStore.online) {
		if (lastVisit < cutoff)
			memoryStore.online.delete(member)
	}
	memoryStore.online.set(uid, now)

	return getVisitorStatsMemory(date)
}

function getVisitorStatsMemory(date: string): VisitorStats {
	const cutoff = Date.now() - ONLINE_WINDOW
	return {
		total: memoryStore.all.size,
		today: memoryStore.today.get(date)?.size || 0,
		online: [...memoryStore.online.values()].filter(lastVisit => lastVisit >= cutoff).length,
	}
}

// ---- 对外接口 ----

/**
 * 解析访客唯一标识：
 * 1. 优先使用前端携带的 x-visitor-id 请求头（localStorage 中的 UUID）
 * 2. 兜底使用 IP + User-Agent 的 SHA-256 哈希前 16 位（应对 CDN/代理导致 IP 相同的问题）
 */
export function resolveVisitorUid(event: H3Event): string {
	const headerId = getHeader(event, 'x-visitor-id')?.trim()
	if (headerId && /^[\w-]{8,64}$/.test(headerId))
		return headerId

	const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
		|| getHeader(event, 'x-real-ip') || ''
	const ua = getHeader(event, 'user-agent') || ''
	return createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 16)
}

/** 记录一次访客访问，返回最新统计 */
export async function recordVisit(uid: string): Promise<VisitorStats> {
	if (redis)
		return recordVisitRedis(uid)
	if (import.meta.dev)
		return recordVisitMemory(uid)
	console.error('[visitorStats] 生产环境未配置 Upstash Redis，无法记录访客统计')
	return { total: 0, today: 0, online: 0 }
}

/** 获取访客统计数据（只读） */
export async function getVisitorStats(): Promise<VisitorStats> {
	if (redis)
		return getVisitorStatsRedis(todayString())
	if (import.meta.dev)
		return getVisitorStatsMemory(todayString())
	return { total: 0, today: 0, online: 0 }
}