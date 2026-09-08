<template>
  <div class="calendar-page">
    <div class="page-header">
      <div>
        <h1>Content Calendar</h1>
        <p>Schedule and manage your posts across platforms</p>
      </div>
      <div class="header-actions">
        <button class="nav-btn" @click="prevWeek">‹</button>
        <span class="current-range">{{ rangeLabel }}</span>
        <button class="nav-btn" @click="nextWeek">›</button>
      </div>
    </div>

    <div v-if="loading" class="cal-loading shimmer"></div>

    <div v-else class="calendar-grid">
      <div class="day-column" v-for="day in weekDays" :key="day.date">
        <div class="day-header" :class="{ today: isToday(day.date) }">
          <span class="day-name">{{ day.name }}</span>
          <span class="day-date">{{ day.label }}</span>
        </div>
        <div
          class="day-body"
          @dragover.prevent="onDragOver(day.date)"
          @dragleave="onDragLeave(day.date)"
          @drop="onDrop(day.date)"
          :class="{ dragover: dragOverDay === day.date }"
        >
          <div
            v-for="post in postsForDay(day.date)"
            :key="post.id"
            class="cal-post"
            :class="post.platform"
            draggable="true"
            @dragstart="onDragStart(post)"
            @click="openPost(post)"
          >
            <div class="cal-post-time">{{ formatTime(post.scheduled_at || post.created_at) }}</div>
            <div class="cal-post-text">{{ post.content.substring(0, 50) }}{{ post.content.length > 50 ? '...' : '' }}</div>
            <div class="cal-post-status" :class="post.status">{{ statusLabel(post.status) }}</div>
          </div>
          <div v-if="postsForDay(day.date).length === 0" class="day-empty">
            <button class="add-btn" @click="addPost(day.date)">+ Add</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Post detail modal -->
    <div v-if="selectedPost" class="modal-overlay" @click="selectedPost = null">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <div class="modal-platform" :class="selectedPost.platform">{{ platformIcon(selectedPost.platform) }}</div>
          <h2>Post Details</h2>
          <button class="modal-close" @click="selectedPost = null">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <label>Content</label>
            <p>{{ selectedPost.content }}</p>
          </div>
          <div v-if="selectedPost.visual_idea" class="detail-row">
            <label>Visual Idea</label>
            <p>{{ selectedPost.visual_idea }}</p>
          </div>
          <div class="detail-row">
            <label>Platform</label>
            <p class="capitalize">{{ selectedPost.platform }}</p>
          </div>
          <div class="detail-row">
            <label>Status</label>
            <span class="status-badge" :class="selectedPost.status">{{ statusLabel(selectedPost.status) }}</span>
          </div>
          <div v-if="selectedPost.scheduled_at" class="detail-row">
            <label>Scheduled For</label>
            <p>{{ formatDateTime(selectedPost.scheduled_at) }}</p>
          </div>
          <div class="detail-row">
            <label>Created</label>
            <p>{{ formatDateTime(selectedPost.created_at) }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-danger" @click="deletePost(selectedPost)">Delete</button>
          <button v-if="selectedPost.status !== 'published'" class="btn-publish" @click="publishPost(selectedPost)">
            Mark as Published
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post, PostStatus } from '~/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const posts = ref<Post[]>([])
const loading = ref(true)
const currentWeekStart = ref(getWeekStart(new Date()))
const selectedPost = ref<Post | null>(null)
const draggedPost = ref<Post | null>(null)
const dragOverDay = ref('')

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day
  return new Date(date.setDate(diff))
}

function prevWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = d
}

function nextWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = d
}

const weekDays = computed(() => {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart.value)
    d.setDate(d.getDate() + i)
    return {
      date: d.toISOString().split('T')[0],
      name: names[d.getDay()],
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
  })
})

const rangeLabel = computed(() => {
  const start = weekDays.value[0].label
  const end = weekDays.value[6].label
  return `${start} — ${end}`
})

function isToday(dateStr: string): boolean {
  return new Date().toISOString().split('T')[0] === dateStr
}

function postsForDay(dateStr: string): Post[] {
  return posts.value.filter(p => {
    const d = p.scheduled_at || p.created_at
    return d && d.split('T')[0] === dateStr
  }).sort((a, b) => {
    const aTime = a.scheduled_at || a.created_at
    const bTime = b.scheduled_at || b.created_at
    return new Date(aTime).getTime() - new Date(bTime).getTime()
  })
}

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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function onDragStart(post: Post) {
  draggedPost.value = post
}

function onDragOver(date: string) {
  dragOverDay.value = date
}

function onDragLeave(date: string) {
  if (dragOverDay.value === date) dragOverDay.value = ''
}

async function onDrop(date: string) {
  dragOverDay.value = ''
  if (!draggedPost.value) return

  const post = draggedPost.value
  draggedPost.value = null

  const newDate = new Date(date)
  const oldDate = new Date(post.scheduled_at || post.created_at)
  newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0)

  const { supabase } = await import('~/utils/supabase')
  await supabase
    .from('posts')
    .update({
      scheduled_at: newDate.toISOString(),
      status: post.status === 'draft' ? 'ready_to_publish' : post.status,
    })
    .eq('id', post.id)

  post.scheduled_at = newDate.toISOString()
  if (post.status === 'draft') post.status = 'ready_to_publish'
}

function openPost(post: Post) {
  selectedPost.value = post
}

function addPost(date: string) {
  navigateTo({ path: '/content-generator', query: { date } })
}

async function deletePost(post: Post) {
  const { supabase } = await import('~/utils/supabase')
  await supabase.from('posts').delete().eq('id', post.id)
  posts.value = posts.value.filter(p => p.id !== post.id)
  selectedPost.value = null
}

async function publishPost(post: Post) {
  const { supabase } = await import('~/utils/supabase')
  await supabase
    .from('posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', post.id)

  post.status = 'published'
  post.published_at = new Date().toISOString()
  selectedPost.value = null
}

onMounted(async () => {
  const { supabase } = await import('~/utils/supabase')
  const userId = auth.user?.id
  if (!userId) return

  const startDate = new Date(currentWeekStart.value)
  startDate.setDate(startDate.getDate() - 7)
  const endDate = new Date(currentWeekStart.value)
  endDate.setDate(endDate.getDate() + 14)

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false })

  posts.value = data || []
  loading.value = false
})
</script>

<style lang="scss" scoped>
$primary: #2563eb;

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;

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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 18px;
  color: #475569;
  background: white;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
}

.current-range {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  min-width: 180px;
  text-align: center;
}

.cal-loading {
  height: 400px;
  border-radius: 16px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-height: 500px;

  @media (max-width: 968px) {
    overflow-x: auto;
    display: flex;
    gap: 12px;

    .day-column {
      min-width: 160px;
      flex-shrink: 0;
    }
  }
}

.day-column {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.day-header {
  padding: 10px 8px;
  text-align: center;
  border-radius: 8px 8px 0 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-bottom: none;

  &.today {
    background: $primary;

    .day-name, .day-date { color: white; }
  }
}

.day-name {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
}

.day-date {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 2px;
}

.day-body {
  flex: 1;
  padding: 6px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 350px;
  transition: background 0.2s;

  &.dragover {
    background: rgba(37, 99, 235, 0.05);
    border-color: $primary;
    border-style: dashed;
  }
}

.day-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  font-size: 13px;
  color: #94a3b8;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
}

.cal-post {
  padding: 8px 10px;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  border-left: 3px solid;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &:active {
    cursor: grabbing;
  }

  &.instagram {
    background: rgba(131, 58, 180, 0.08);
    border-left-color: #833ab4;
  }

  &.twitter {
    background: rgba(29, 155, 240, 0.08);
    border-left-color: #1d9bf0;
  }

  &.youtube {
    background: rgba(255, 0, 0, 0.08);
    border-left-color: #ff0000;
  }
}

.cal-post-time {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}

.cal-post-text {
  font-size: 13px;
  color: #1e293b;
  line-height: 1.4;
  margin-bottom: 6px;
}

.cal-post-status {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 100px;
  display: inline-block;

  &.draft { background: #f1f5f9; color: #64748b; }
  &.generating_content { background: #fff7ed; color: #ea580c; }
  &.content_generated { background: #f0fdf4; color: #16a34a; }
  &.ready_to_publish { background: #dbeafe; color: #2563eb; }
  &.published { background: #f0fdf4; color: #22c55e; }
  &.failed { background: #fef2f2; color: #ef4444; }
}

// Modal
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
  animation: fadeIn 0.2s ease-out;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;

  h2 {
    flex: 1;
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }
}

.modal-platform {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 18px;

  &.instagram { background: linear-gradient(135deg, #833ab4, #fd1d1d); color: white; }
  &.twitter { background: linear-gradient(135deg, #1d9bf0, #0c7abf); color: white; }
  &.youtube { background: linear-gradient(135deg, #ff0000, #cc0000); color: white; }
}

.modal-close {
  font-size: 28px;
  color: #94a3b8;

  &:hover { color: #475569; }
}

.modal-body {
  padding: 24px;
}

.detail-row {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  p {
    font-size: 15px;
    color: #1e293b;
    line-height: 1.6;
  }
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
  text-transform: capitalize;

  &.draft { background: #f1f5f9; color: #64748b; }
  &.generating_content { background: #fff7ed; color: #ea580c; }
  &.content_generated { background: #f0fdf4; color: #16a34a; }
  &.ready_to_publish { background: #dbeafe; color: #2563eb; }
  &.published { background: #f0fdf4; color: #22c55e; }
  &.failed { background: #fef2f2; color: #ef4444; }
}

.capitalize { text-transform: capitalize; }

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-danger {
  flex: 1;
  padding: 10px;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;

  &:hover { background: #fee2e2; }
}

.btn-publish {
  flex: 1;
  padding: 10px;
  background: #f0fdf4;
  color: #22c55e;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;

  &:hover { background: #dcfce7; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
</style>
