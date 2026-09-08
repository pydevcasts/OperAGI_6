<template>
  <div class="dashboard-page">
    <!-- Welcome -->
    <div class="welcome">
      <h1>Welcome back, {{ firstName }}!</h1>
      <p>Here's an overview of your content performance.</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.bg }">{{ stat.icon }}</div>
        <div class="stat-body">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div v-if="stat.trend" class="stat-trend" :class="stat.trendDir">
          {{ stat.trend }}
        </div>
      </div>
    </div>

    <!-- Two columns -->
    <div class="columns">
      <!-- Recent Posts -->
      <div class="panel">
        <div class="panel-header">
          <h2>Recent Posts</h2>
          <NuxtLink to="/content-generator" class="panel-link">Create new →</NuxtLink>
        </div>
        <div v-if="loading" class="loading-list">
          <div v-for="i in 3" :key="i" class="shimmer-row shimmer"></div>
        </div>
        <div v-else-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>No posts yet. Create your first post!</p>
          <NuxtLink to="/content-generator" class="btn-primary">Create Post</NuxtLink>
        </div>
        <div v-else class="post-list">
          <div v-for="post in posts" :key="post.id" class="post-row">
            <div class="post-platform" :class="post.platform">{{ platformIcon(post.platform) }}</div>
            <div class="post-content">
              <div class="post-text">{{ post.content.substring(0, 80) }}{{ post.content.length > 80 ? '...' : '' }}</div>
              <div class="post-meta">
                <span class="status-badge" :class="post.status">{{ statusLabel(post.status) }}</span>
                <span class="post-date">{{ formatDate(post.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connected Accounts -->
      <div class="panel">
        <div class="panel-header">
          <h2>Connected Accounts</h2>
          <NuxtLink to="/social-accounts" class="panel-link">Manage →</NuxtLink>
        </div>
        <div v-if="accountsLoading" class="loading-list">
          <div v-for="i in 3" :key="i" class="shimmer-row shimmer"></div>
        </div>
        <div v-else-if="accounts.length === 0" class="empty-state">
          <div class="empty-icon">🔗</div>
          <p>Connect your social accounts to get started.</p>
          <NuxtLink to="/social-accounts" class="btn-primary">Connect Account</NuxtLink>
        </div>
        <div v-else class="account-list">
          <div v-for="acc in accounts" :key="acc.id" class="account-row">
            <div class="account-platform-icon" :class="acc.provider">{{ platformIcon(acc.provider) }}</div>
            <div class="account-info">
              <div class="account-name">{{ acc.provider_username || capitalize(acc.provider) }}</div>
              <div class="account-provider">{{ capitalize(acc.provider) }}</div>
            </div>
            <div class="account-status">
              <span class="dot active"></span> Active
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <NuxtLink to="/content-generator" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #2563eb, #1d4ed8)">✨</div>
          <h3>Generate Content</h3>
          <p>Create AI-powered captions and hashtags</p>
        </NuxtLink>
        <NuxtLink to="/calendar" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a)">📅</div>
          <h3>View Calendar</h3>
          <p>Schedule and manage your posts</p>
        </NuxtLink>
        <NuxtLink to="/analytics" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)">📊</div>
          <h3>View Analytics</h3>
          <p>Track performance across platforms</p>
        </NuxtLink>
        <NuxtLink to="/social-accounts" class="action-card">
          <div class="action-icon" style="background: linear-gradient(135deg, #f97316, #ea580c)">🔗</div>
          <h3>Connect Account</h3>
          <p>Link your social media profiles</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post, SocialAccount, PostStatus } from '~/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()

const firstName = computed(() => {
  const email = auth.user?.email || 'User'
  return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
})

const posts = ref<Post[]>([])
const accounts = ref<SocialAccount[]>([])
const loading = ref(true)
const accountsLoading = ref(true)

const stats = computed(() => [
  { icon: '📝', label: 'Total Posts', value: posts.value.length, bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', trend: '', trendDir: '' },
  { icon: '✅', label: 'Published', value: posts.value.filter(p => p.status === 'published').length, bg: 'linear-gradient(135deg, #22c55e, #16a34a)', trend: '', trendDir: '' },
  { icon: '⏳', label: 'Scheduled', value: posts.value.filter(p => p.status === 'ready_to_publish').length, bg: 'linear-gradient(135deg, #f59e0b, #d97706)', trend: '', trendDir: '' },
  { icon: '🔗', label: 'Connected Accounts', value: accounts.value.length, bg: 'linear-gradient(135deg, #f97316, #ea580c)', trend: '', trendDir: '' },
])

function platformIcon(p: string): string {
  const icons: Record<string, string> = { instagram: '📷', twitter: '🐦', youtube: '▶' }
  return icons[p] || '📄'
}

function statusLabel(s: PostStatus): string {
  const labels: Record<PostStatus, string> = {
    draft: 'Draft',
    generating_content: 'Generating',
    content_generated: 'Generated',
    ready_to_publish: 'Ready',
    published: 'Published',
    failed: 'Failed',
  }
  return labels[s] || s
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  const { supabase } = await import('~/utils/supabase')
  const userId = auth.user?.id
  if (!userId) return

  const { data: postsData } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
  posts.value = postsData || []
  loading.value = false

  const { data: accountsData } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('connected_at', { ascending: false })
  accounts.value = accountsData || []
  accountsLoading.value = false
})
</script>

<style lang="scss" scoped>
.welcome {
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
  gap: 16px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
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
  flex-shrink: 0;
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

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 100px;

  &.up { background: #f0fdf4; color: #16a34a; }
  &.down { background: #fef2f2; color: #dc2626; }
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;

  h2 {
    font-size: 17px;
    font-weight: 700;
    color: #1e293b;
  }
}

.panel-link {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

.loading-list {
  padding: 24px;
}

.shimmer-row {
  height: 56px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;

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
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #1d4ed8;
    color: white;
  }
}

.post-list, .account-list {
  padding: 12px;
}

.post-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
}

.post-platform {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  flex-shrink: 0;

  &.instagram { background: linear-gradient(135deg, #833ab4, #fd1d1d); color: white; }
  &.twitter { background: linear-gradient(135deg, #1d9bf0, #0c7abf); color: white; }
  &.youtube { background: linear-gradient(135deg, #ff0000, #cc0000); color: white; }
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-text {
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 100px;
  text-transform: capitalize;

  &.draft { background: #f1f5f9; color: #64748b; }
  &.generating_content { background: #fff7ed; color: #ea580c; }
  &.content_generated { background: #f0fdf4; color: #16a34a; }
  &.ready_to_publish { background: #dbeafe; color: #2563eb; }
  &.published { background: #f0fdf4; color: #22c55e; }
  &.failed { background: #fef2f2; color: #ef4444; }
}

.post-date {
  font-size: 12px;
  color: #94a3b8;
}

.account-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s;

  &:hover {
    background: #f8fafc;
  }
}

.account-platform-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
  flex-shrink: 0;

  &.instagram { background: linear-gradient(135deg, #833ab4, #fd1d1d); color: white; }
  &.twitter { background: linear-gradient(135deg, #1d9bf0, #0c7abf); color: white; }
  &.youtube { background: linear-gradient(135deg, #ff0000, #cc0000); color: white; }
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-provider {
  font-size: 13px;
  color: #94a3b8;
  text-transform: capitalize;
}

.account-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #22c55e;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.active { background: #22c55e; }
}

.quick-actions {
  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 16px;
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.action-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
    border-color: transparent;
  }

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 12px 0 4px;
  }

  p {
    font-size: 13px;
    color: #64748b;
  }
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 22px;
  color: white;
}
</style>
