export default defineNuxtPlugin(() => {
	const { recordVisit } = useVisitorStats()
	recordVisit()
})