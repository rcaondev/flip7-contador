<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
const canvas = ref(null)
let raf, parts = []
const colors = ['#f43f5e', '#fde047', '#a78bfa', '#34d399', '#60a5fa', '#f472b6']
function burst(w, h) {
  for (let i = 0; i < 160; i++) parts.push({
    x: w / 2, y: h * 0.35, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 4,
    s: Math.random() * 8 + 5, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    c: colors[i % colors.length], life: 0,
  })
}
onMounted(() => {
  const cv = canvas.value, ctx = cv.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr)
  burst(innerWidth, innerHeight)
  setTimeout(() => burst(innerWidth, innerHeight), 600)
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    parts = parts.filter((p) => p.y < innerHeight + 20 && p.life < 400)
    for (const p of parts) {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r)
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore()
    }
    if (parts.length) raf = requestAnimationFrame(tick)
  }
  tick()
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>
<template><canvas ref="canvas" class="pointer-events-none fixed inset-0 z-50 h-full w-full" /></template>
