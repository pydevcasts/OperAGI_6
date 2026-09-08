<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1>Analytics</h1>
      <p>Compare performance across your social media platforms</p>
    </div>

    <div v-if="loading" class="stats-loading">
      <div v-for="i in 4" :key="i" class="shimmer-card shimmer"></div>
    </div>

    <template v-else>
      <!-- Overview stats -->
      <div class="stats-grid">
        <div v-for="stat in overviewStats" :key="stat.label" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bg }">{{ stat.icon }}</div>
          <div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Platform breakdown -->
      <div class="panel">
        <h2 class="panel-title">Platform Breakdown</h2>
        <div v-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>No posts to analyze yet. Create some content first!</p>
          <NuxtLink to="/content-generator" class="btn-primary">Generate Content</NuxtLink>
        </div>
        <div v-else class="platform-chart">
          <div v-for="p in platformBreakdown" :key="p.platform" class="platform-bar">
            <div class="platform-label">
              <span class="platform-emoji" :class="p.platform">{{ platformIcon(p.platform) }}</span>
              <span class="capitalize">{{ p.platform }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: p.percentage + '%', background: p.color }">
                <span class="bar-count">{{ p.count }}</span>
              </div>
            </div>
            <div class="bar-percent">{{ p.percentage }}%</div>
          </div>
        </div>
      </div>

      <!-- Status breakdown -->
      <div class="columns">
        <div class="panel">
          <h2 class="panel-title">Post Status Distribution</h2>
          <div class="status-list">
            <div v-for="s in statusBreakdown" :key="s.status" class="status-row">
              <span class="status-dot" :class="s.status"></span>
              <span class="status-name">{{ s.label }}</span>
              <span class="status-count">{{ s.count }}</span>
              <div class="status-bar-track">
                <div class="status-bar-fill" :style="{ width: s.percentage + '%' }" :class="s.status"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <h2 class="panel-title">Recent Activity</h2>
          <div class="activity-list">
            <div v-for="post in recentPosts" :key="post.id" class="activity-row">
              <div class="activity-platform" :class="post.platform">{{ platformIcon(post.platform) }}</div>
              <div class="activity-content">
                <div class="activity-text">{{ post.content.substring(0, 60) }}{{ post.content.length > 60 ? '...' : '' }}</div>
                <div class="activity-date">{{ formatDate(post.created_at) }}</div>
              </div>
              <span class="status-badge" :class="post.status">{{ statusLabel(post.status) }}</span>
            </div>
          </div>
          <div v-if="recentPosts.length === 0" class="empty-inline">No recent activity</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Post, PostStatus } from '~/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const posts = ref<Post[]>([])
const loading = ref(true)

const overviewStats = computed(() => [
  { icon: '📝', label: 'Total Posts', value: posts.value.length, bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  { icon: '✅', label: 'Published', value: posts.value.filter(p => p.status === 'published').length, bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  { icon: '⏳', label: 'Scheduled', value: posts.value.filter(p => p.status === 'ready_to_publish').length, bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { icon: '🔄', label: 'In Progress', value: posts.value.filter(p => p.status === 'generating_content' || p.status === 'content_generated').length, bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
])

const platformBreakdown = computed(() => {
  const platforms = ['instagram', 'twitter', 'youtube']
  const colors: Record<string, string> = {
    instagram: 'linear-gradient(90deg, #833ab4, #fd1d1d)',
    twitter: 'linear-gradient(90deg, #1d9bf0, #0c7abf)',
    youtube: 'linear-gradient(90deg, #ff0000, #cc0000)',
  }
  const total = posts.value.length || 1
  return platforms.map(p => {
    const count = posts.value.filter(post => post.platform === p).length
    return {
      platform: p,
      count,
      percentage: Math.round((count / total) * 100),
      color: colors[p],
    }
  })
})

const statusBreakdown = computed(() => {
  const statuses: { status: PostStatus; label: string }[] = [
    { status: 'draft', label: 'Draft' },
    { status: 'generating_content', label: 'Generating' },
    { status: 'content_generated', label: 'Generated' },
    { status: 'ready_to_publish', label: 'Scheduled' },
    { status: 'published', label: 'Published' },
    { status: 'failed', label: 'Failed' },
  ]
  const total = posts.value.length || 1
  return statuses.map(s => {
    const count = posts.value.filter(p => p.status === s.status).length
    return { ...s, count, percentage: Math.round((count / total) * 100) }
  })
})

const recentPosts = computed(() => posts.value.slice(0, 5))

function platformIcon(p: string): string {
  const icons: Record<string, string> = { instagram: '📷', twitter: '🐦', youtube: '▶' }
  return icons[p] || '📄'
}

function statusLabel(s: PostStatus): string {
  const labels: Record<PostStatus, string> = {
    draft: 'Draft',
    generating_content: 'Generating',
    content_generated: 'Generated',
    ready_to_publish: 'Scheduled',
    published: 'Published',
    failed: 'Failed',
  }
  return labels[s] || s
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  const { supabase } = await import('~/utils/supabase')
  const userId = auth.user?.id
  if (!userId) return

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  posts.value = data || []
  loading.value = false
})
</script>

<style lang="scss" scoped>
$primary: #2563eb;

.page-header {
  margin-bottom: 32px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  p {
    font-size: 15px;
    color: #64748b;
  }
}

.stats-loading {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.shimmer-card {
  height: 80px;
  border-radius: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  font-size: 13px;
  color: #94a3b8;
}

.panel {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 24px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    font-size: 15px;
    color: #64748b;
    margin-bottom: 20px;
  }
}

.btn-primary {
  display: inline-flex;
  padding: 10px 20px;
  background: $primary;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;

  &:hover { background: #1d4ed8; color: white; }
}

.platform-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.platform-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.platform-label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.platform-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 14px;

  &.instagram { background: rgba(131, 58, 180, 0.1); }
  &.twitter { background: rgba(29, 155, 240, 0.1); }
  &.youtube { background: rgba(255, 0, 0, 0.1); }
}

.capitalize { text-transform: capitalize; }

.bar-track {
  flex: 1;
  height: 32px;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding-left: 12px;
  transition: width 0.5s ease;
  min-width: 28px;
}

.bar-count {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.bar-percent {
  width: 48px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .panel { margin-bottom: 0; }
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;

  &.draft { background: #94a3b8; }
  &.generating_content { background: #f97316; }
  &.content_generated { background: #22c55e; }
  &.ready_to_publish { background: #2563eb; }
  &.published { background: #16a34a; }
  &.failed { background: #ef4444; }
}

.status-name {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  width: 90px;
}

.status-count {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  width: 24px;
  text-align: center;
}

.status-bar-track {
  flex: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 100px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;

  &.draft { background: #94a3b8; }
  &.generating_content { background: #f97316; }
  &.content_generated { background: #22c55e; }
  &.ready_to_publish { background: #2563eb; }
  &.published { background: #16a34a; }
  &.failed { background: #ef4444; }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.2s;

  &:hover { background: #f8fafc; }
}

.activity-platform {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 18px;
  flex-shrink: 0;

  &.instagram { background: rgba(131, 58, 180, 0.1); }
  &.twitter { background: rgba(29, 155, 240, 0.1); }
  &.youtube { background: rgba(255, 0, 0, 0.1); }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 14px;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-date {
  font-size: 12px;
  color: #94a3b8;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 100px;
  text-transform: capitalize;
  flex-shrink: 0;

  &.draft { background: #f1f5f9; color: #64748b; }
  &.generating_content { background: #fff7ed; color: #ea580c; }
  &.content_generated { background: #f0fdf4; color: #16a34a; }
  &.ready_to_publish { background: #dbeafe; color: #2563eb; }
  &.published { background: #f0fdf4; color: #22c55e; }
  &.failed { background: #fef2f2; color: #ef4444; }
}

.empty-inline {
  text-align: center;
  padding: 24px;
  font-size: 14px;
  color: #94a3b8;
}
</style>
