<template>
  <div class="generator-page">
    <div class="page-header">
      <h1>Content Generator</h1>
      <p>Create AI-powered content for your social media platforms</p>
    </div>

    <div v-if="accounts.length === 0 && !loading" class="empty-banner">
      <p>You need to connect a social account first.</p>
      <NuxtLink to="/social-accounts" class="btn-primary">Connect Account →</NuxtLink>
    </div>

    <div class="generator-grid">
      <!-- Left: Input form -->
      <div class="input-panel">
        <h2 class="panel-title">Content Details</h2>

        <div class="field">
          <label>Platform</label>
          <div class="platform-selector">
            <button
              v-for="p in availablePlatforms"
              :key="p.id"
              class="platform-btn"
              :class="{ active: form.platform === p.id }"
              @click="form.platform = p.id"
              :disabled="!p.connected"
            >
              <span class="platform-emoji">{{ p.icon }}</span>
              <span>{{ p.name }}</span>
              <span v-if="!p.connected" class="platform-status">Not connected</span>
            </button>
          </div>
        </div>

        <div class="field">
          <label for="content">Content Idea / Topic</label>
          <textarea
            id="content"
            v-model="form.content"
            rows="4"
            placeholder="e.g. Tips for growing on Instagram organically without ads"
            class="content-input"
          ></textarea>
        </div>

        <div class="field">
          <label for="visual">Visual Idea (optional)</label>
          <textarea
            id="visual"
            v-model="form.visualIdea"
            rows="2"
            placeholder="e.g. A behind-the-scenes photo of my workspace"
            class="content-input"
          ></textarea>
        </div>

        <div class="field">
          <label>Language</label>
          <div class="lang-selector">
            <button class="lang-btn" :class="{ active: form.language === 'en' }" @click="form.language = 'en'">English</button>
            <button class="lang-btn" :class="{ active: form.language === 'fa' }" @click="form.language = 'fa'">فارسی</button>
          </div>
        </div>

        <button
          class="btn-generate"
          @click="handleGenerate"
          :disabled="generating || !form.content || !form.platform"
        >
          <span v-if="generating" class="spinner"></span>
          <span v-if="generating">Generating content...</span>
          <span v-else>✨ Generate Content</span>
        </button>

        <div v-if="generateError" class="alert-error">{{ generateError }}</div>
      </div>

      <!-- Right: Output -->
      <div class="output-panel">
        <div v-if="!generated && !generating" class="output-empty">
          <div class="empty-icon">✨</div>
          <h3>AI Content will appear here</h3>
          <p>Fill in the form and click "Generate Content" to create captions, hashtags, and more.</p>
        </div>

        <div v-else-if="generating" class="output-loading">
          <div class="loading-spinner"></div>
          <h3>Generating your content...</h3>
          <p>Our AI is crafting the perfect post for you.</p>
        </div>

        <div v-else class="output-content">
          <div class="output-header">
            <h2>Generated Content</h2>
            <button class="btn-copy" @click="copyToClipboard">Copy</button>
          </div>

          <!-- Instagram -->
          <div v-if="form.platform === 'instagram'" class="content-sections">
            <div class="section">
              <label>Caption</label>
              <div class="content-box">{{ generated.generated_text }}</div>
            </div>
            <div class="section">
              <label>Suggested Hashtags</label>
              <div class="hashtag-box">
                <span
                  v-for="tag in parseHashtags(generated.suggested_hashtags)"
                  :key="tag"
                  class="hashtag-chip"
                >{{ tag }}</span>
              </div>
            </div>
            <div v-if="generated.suggested_publish_time" class="section">
              <label>Suggested Publish Time</label>
              <div class="time-box">{{ formatDateTime(generated.suggested_publish_time) }}</div>
            </div>
          </div>

          <!-- Twitter -->
          <div v-if="form.platform === 'twitter'" class="content-sections">
            <div v-if="generated.thread_tweets && generated.thread_tweets.length > 1" class="section">
              <label>Thread ({{ generated.thread_tweets.length }} tweets)</label>
              <div v-for="(tweet, i) in generated.thread_tweets" :key="i" class="tweet-box">
                <span class="tweet-num">{{ i + 1 }}</span>
                <span class="tweet-text">{{ tweet }}</span>
              </div>
            </div>
            <div v-else class="section">
              <label>Tweet</label>
              <div class="content-box">{{ generated.generated_text }}</div>
            </div>
            <div class="section">
              <label>Hashtags</label>
              <div class="hashtag-box">
                <span
                  v-for="tag in parseHashtags(generated.suggested_hashtags)"
                  :key="tag"
                  class="hashtag-chip"
                >{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- YouTube -->
          <div v-if="form.platform === 'youtube'" class="content-sections">
            <div class="section">
              <label>SEO Title</label>
              <div class="content-box">{{ generated.seo_title }}</div>
            </div>
            <div class="section">
              <label>Description</label>
              <div class="content-box whitespace-pre">{{ generated.seo_description }}</div>
            </div>
            <div class="section">
              <label>Tags</label>
              <div class="hashtag-box">
                <span
                  v-for="tag in generated.seo_tags?.split(', ').filter(Boolean)"
                  :key="tag"
                  class="tag-chip"
                >{{ tag }}</span>
              </div>
            </div>
          </div>

          <div class="output-actions">
            <button class="btn-save" @click="savePost">Save as Draft</button>
            <NuxtLink to="/calendar" class="btn-schedule">Schedule Post →</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SocialAccount, Provider, GeneratedContent } from '~/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()

const accounts = ref<SocialAccount[]>([])
const loading = ref(true)
const generating = ref(false)
const generateError = ref('')
const generated = ref<GeneratedContent | null>(null)
const savedPostId = ref<string | null>(null)

const form = reactive({
  platform: 'instagram' as Provider,
  content: '',
  visualIdea: '',
  language: 'en',
})

const availablePlatforms = computed(() => [
  { id: 'instagram' as Provider, name: 'Instagram', icon: '📷', connected: accounts.value.some(a => a.provider === 'instagram') },
  { id: 'twitter' as Provider, name: 'Twitter/X', icon: '🐦', connected: accounts.value.some(a => a.provider === 'twitter') },
  { id: 'youtube' as Provider, name: 'YouTube', icon: '▶', connected: accounts.value.some(a => a.provider === 'youtube') },
])

watch(availablePlatforms, (val) => {
  const current = val.find(p => p.id === form.platform)
  if (current && !current.connected) {
    const firstConnected = val.find(p => p.connected)
    if (firstConnected) form.platform = firstConnected.id
  }
}, { immediate: false })

async function handleGenerate() {
  generating.value = true
  generateError.value = ''
  generated.value = null

  try {
    const { supabase } = await import('~/utils/supabase')
    const userId = auth.user?.id
    if (!userId) throw new Error('Not authenticated')

    const socialAccount = accounts.value.find(a => a.provider === form.platform)

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        social_account_id: socialAccount?.id || null,
        platform: form.platform,
        content: form.content,
        visual_idea: form.visualIdea || null,
        status: 'generating_content',
      })
      .select()
      .single()

    if (postError) throw postError
    savedPostId.value = post.id

    const { data: session } = await supabase.auth.getSession()
    const accessToken = session.session?.access_token
    if (!accessToken) throw new Error('No access token')

    const supabaseUrl = useRuntimeConfig().public.supabaseUrl
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        postId: post.id,
        platform: form.platform,
        content: form.content,
        visualIdea: form.visualIdea,
        language: form.language,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `Generation failed (${response.status})`)
    }

    const result = await response.json()
    generated.value = result.content
  } catch (err: any) {
    generateError.value = err.message || 'Failed to generate content'
  } finally {
    generating.value = false
  }
}

function parseHashtags(str: string | null): string[] {
  if (!str) return []
  return str.split(/\s+/).filter((s: string) => s.startsWith('#'))
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

async function copyToClipboard() {
  if (!generated.value) return
  const text = [
    generated.value.generated_text,
    generated.value.suggested_hashtags,
    generated.value.seo_title,
    generated.value.seo_description,
    generated.value.seo_tags,
  ].filter(Boolean).join('\n\n')
  await navigator.clipboard.writeText(text)
}

async function savePost() {
  if (!savedPostId.value) return
  const { supabase } = await import('~/utils/supabase')
  await supabase
    .from('posts')
    .update({ status: 'content_generated' })
    .eq('id', savedPostId.value)
  await navigateTo('/calendar')
}

onMounted(async () => {
  const { supabase } = await import('~/utils/supabase')
  const userId = auth.user?.id
  if (!userId) return

  const { data } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  accounts.value = data || []
  loading.value = false

  const firstConnected = availablePlatforms.value.find(p => p.connected)
  if (firstConnected) form.platform = firstConnected.id
})
</script>

<style lang="scss" scoped>
$primary: #2563eb;
$primary-dark: #1d4ed8;

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

.empty-banner {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  margin-bottom: 24px;

  p {
    color: #9a3412;
    margin-bottom: 12px;
    font-weight: 500;
  }
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: $primary;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;

  &:hover { background: $primary-dark; color: white; }
}

.generator-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.input-panel, .output-panel {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
}

.field {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }
}

.platform-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.platform-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #cbd5e1;
  }

  &.active {
    border-color: $primary;
    background: rgba(37, 99, 235, 0.05);
    color: $primary;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.platform-emoji {
  font-size: 18px;
}

.platform-status {
  font-size: 11px;
  color: #94a3b8;
}

.content-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}

.lang-selector {
  display: flex;
  gap: 8px;
}

.lang-btn {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;

  &.active {
    border-color: $primary;
    background: rgba(37, 99, 235, 0.05);
    color: $primary;
  }
}

.btn-generate {
  width: 100%;
  padding: 14px;
  background: $primary;
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: $primary-dark;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert-error {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.output-empty, .output-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  min-height: 400px;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #94a3b8;
    max-width: 280px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.output-content {
  animation: fadeIn 0.3s ease-out;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }
}

.btn-copy {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
}

.content-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }
}

.content-box {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: #1e293b;
  white-space: pre-wrap;
  word-break: break-word;
}

.whitespace-pre {
  white-space: pre-wrap;
}

.hashtag-box {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.hashtag-chip {
  padding: 4px 10px;
  background: rgba(37, 99, 235, 0.1);
  color: $primary;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
}

.tag-chip {
  padding: 4px 10px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  font-size: 13px;
}

.time-box {
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  font-size: 14px;
  color: #16a34a;
  font-weight: 600;
}

.tweet-box {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 8px;

  &:last-child { margin-bottom: 0; }
}

.tweet-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: $primary;
  color: white;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.tweet-text {
  font-size: 14px;
  line-height: 1.6;
  color: #1e293b;
  white-space: pre-wrap;
}

.output-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.btn-save {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
}

.btn-schedule {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background: $primary;
  color: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;

  &:hover { background: $primary-dark; color: white; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
