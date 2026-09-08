<template>
  <div class="auth-form">
    <div class="form-card">
      <div class="mobile-brand">
        <span class="brand-icon">O</span>
        <span>OperAGI</span>
      </div>
      <h1>Welcome back</h1>
      <p class="form-sub">Sign in to your OperAGI account</p>

      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}</div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            :disabled="loading"
            autocomplete="email"
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="divider"><span>or</span></div>

      <div class="social-buttons">
        <button class="social-btn google" @click="handleGoogleLogin" :disabled="socialLoading">
          <span class="social-icon">G</span> Google
        </button>
      </div>

      <p class="form-footer">
        Don't have an account?
        <NuxtLink to="/register">Sign up free</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const socialLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message || 'Failed to sign in. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  socialLoading.value = true
  errorMsg.value = ''
  try {
    const { supabase } = await import('~/utils/supabase')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  } catch (err: any) {
    errorMsg.value = err.message || 'Google sign-in failed'
    socialLoading.value = false
  }
}

onMounted(() => {
  if (route.query.error === 'google-failed') {
    errorMsg.value = 'Google sign-in failed. Please try again.'
  }
})
</script>

<style lang="scss" scoped>
.auth-form {
  width: 100%;
  max-width: 420px;
}

.mobile-brand {
  display: none;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  color: #1e293b;
  margin-bottom: 32px;

  @media (max-width: 968px) {
    display: flex;
  }
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-weight: 800;
  font-size: 18px;
}

.form-card {
  width: 100%;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.form-sub {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 32px;
}

.alert-error {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 24px;
  animation: slideUp 0.3s ease-out;
}

.field {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }

  input {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 15px;
    color: #1e293b;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: white;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    &::placeholder {
      color: #cbd5e1;
    }
  }
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.divider {
  text-align: center;
  margin: 24px 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0; right: 0;
    height: 1px;
    background: #e2e8f0;
  }

  span {
    position: relative;
    background: #f8fafc;
    padding: 0 16px;
    font-size: 13px;
    color: #94a3b8;
  }
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: white;
  color: #4285f4;
  font-weight: 700;
  font-size: 14px;
  border: 1px solid #e2e8f0;
}

.form-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: #64748b;

  a {
    color: #2563eb;
    font-weight: 600;
  }
}
</style>
