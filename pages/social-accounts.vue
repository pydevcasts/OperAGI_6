<template>
  <div class="social-accounts-page">
    <div class="page-header">
      <div>
        <h1>Social Accounts</h1>
        <p>Connect your social media platforms to OperAGI</p>
      </div>
    </div>

    <div v-if="loading" class="accounts-grid">
      <div v-for="i in 3" :key="i" class="account-card shimmer"></div>
    </div>

    <div v-else class="accounts-grid">
      <div
        v-for="provider in providers"
        :key="provider.id"
        class="account-card"
        :class="{ connected: isConnected(provider.id) }"
      >
        <div class="card-header">
          <div class="provider-icon" :style="{ background: provider.bg }">{{ provider.icon }}</div>
          <div class="provider-info">
            <h3>{{ provider.name }}</h3>
            <p>{{ provider.desc }}</p>
          </div>
        </div>

        <div v-if="isConnected(provider.id)" class="connected-info">
          <div class="connected-user">
            <div class="user-avatar" v-if="getAccount(provider.id)?.provider_avatar_url">
              <img :src="getAccount(provider.id)!.provider_avatar_url!" alt="avatar" />
            </div>
            <div class="user-avatar placeholder" v-else>{{ provider.icon }}</div>
            <div>
              <div class="username">{{ getAccount(provider.id)?.provider_username || 'Connected' }}</div>
              <div class="status">
                <span class="dot active"></span> Active
              </div>
            </div>
          </div>
          <button class="btn-disconnect" @click="disconnect(provider.id)">Disconnect</button>
        </div>

        <div v-else class="disconnected-info">
          <button class="btn-connect" @click="connect(provider.id)">
            Connect {{ provider.name }}
          </button>
        </div>

        <div v-if="provider.id === 'instagram'" class="card-note">
          Note: Instagram Graph API requires a Facebook Business account.
        </div>
        <div v-if="provider.id === 'twitter'" class="card-note">
          Note: Twitter/X API v2 requires developer access.
        </div>
        <div v-if="provider.id === 'youtube'" class="card-note">
          Note: YouTube Data API v3 requires a Google account.
        </div>
      </div>
    </div>

    <!-- Connect Modal -->
    <div v-if="connectModal.show" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Connect {{ capitalize(connectModal.provider) }}</h2>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">
            Enter your {{ capitalize(connectModal.provider) }} username to connect your account.
            You'll need to authorize OperAGI to manage your content.
          </p>
          <div class="field">
            <label>Username / Handle</label>
            <input
              v-model="connectModal.username"
              type="text"
              :placeholder="`@your_${connectModal.provider}_handle`"
              class="modal-input"
            />
          </div>
          <div v-if="connectModal.error" class="modal-error">{{ connectModal.error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">Cancel</button>
          <button class="btn-confirm" @click="confirmConnect" :disabled="connectModal.loading">
            {{ connectModal.loading ? 'Connecting...' : 'Connect' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SocialAccount, Provider } from '~/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const auth = useAuthStore()
const accounts = ref<SocialAccount[]>([])
const loading = ref(true)

const providers = [
  { id: 'instagram' as Provider, name: 'Instagram', icon: '📷', bg: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', desc: 'Generate captions, hashtags, and schedule posts' },
  { id: 'twitter' as Provider, name: 'Twitter/X', icon: '🐦', bg: 'linear-gradient(135deg, #1d9bf0, #0c7abf)', desc: 'Create tweets, threads, and schedule content' },
  { id: 'youtube' as Provider, name: 'YouTube', icon: '▶', bg: 'linear-gradient(135deg, #ff0000, #cc0000)', desc: 'Generate SEO titles, descriptions, and tags' },
]

const connectModal = reactive({
  show: false,
  provider: '' as Provider,
  username: '',
  error: '',
  loading: false,
})

function isConnected(provider: Provider): boolean {
  return accounts.value.some(a => a.provider === provider && a.is_active)
}

function getAccount(provider: Provider): SocialAccount | undefined {
  return accounts.value.find(a => a.provider === provider)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function connect(provider: Provider) {
  connectModal.show = true
  connectModal.provider = provider
  connectModal.username = ''
  connectModal.error = ''
  connectModal.loading = false
}

function closeModal() {
  connectModal.show = false
}

async function confirmConnect() {
  if (!connectModal.username.trim()) {
    connectModal.error = 'Please enter your username.'
    return
  }

  connectModal.loading = true
  connectModal.error = ''

  try {
    const { supabase } = await import('~/utils/supabase')
    const userId = auth.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('social_accounts')
      .insert({
        user_id: userId,
        provider: connectModal.provider,
        provider_username: connectModal.username.trim(),
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        connectModal.error = 'This platform is already connected.'
      } else {
        connectModal.error = error.message
      }
      connectModal.loading = false
      return
    }

    if (data) {
      accounts.value.push(data)
    }

    connectModal.show = false
  } catch (err: any) {
    connectModal.error = err.message || 'Failed to connect account.'
  } finally {
    connectModal.loading = false
  }
}

async function disconnect(provider: Provider) {
  const account = getAccount(provider)
  if (!account) return

  const { supabase } = await import('~/utils/supabase')
  await supabase
    .from('social_accounts')
    .delete()
    .eq('id', account.id)

  accounts.value = accounts.value.filter(a => a.id !== account.id)
}

onMounted(async () => {
  const { supabase } = await import('~/utils/supabase')
  const userId = auth.user?.id
  if (!userId) return

  const { data } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('connected_at', { ascending: false })

  accounts.value = data || []
  loading.value = false
})
</script>

<style lang="scss" scoped>
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

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.account-card {
  background: white;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  padding: 24px;
  transition: all 0.3s;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  &.connected {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  &.shimmer {
    height: 220px;
  }
}

.card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.provider-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.provider-info {
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  p {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
  }
}

.connected-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.connected-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &.placeholder {
    background: #f1f5f9;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #22c55e;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.active { background: #22c55e; }
}

.btn-disconnect {
  padding: 8px 14px;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
  }
}

.btn-connect {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }
}

.card-note {
  margin-top: 14px;
  padding: 10px 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  font-size: 12px;
  color: #92400e;
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
  max-width: 460px;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }
}

.modal-close {
  font-size: 28px;
  color: #94a3b8;

  &:hover {
    color: #475569;
  }
}

.modal-body {
  padding: 24px;
}

.modal-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
}

.field {
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
}

.modal-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
}

.modal-error {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }
}

.btn-confirm {
  flex: 1;
  padding: 10px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
