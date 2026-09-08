<template>
  <div class="auth-layout">
    <div class="auth-left">
      <div class="auth-brand">
        <NuxtLink to="/" class="brand-link">
          <span class="brand-icon">O</span>
          <span class="brand-text">OperAGI</span>
        </NuxtLink>
      </div>
      <div class="auth-hero">
        <h1 class="hero-title">AI-Powered Influencer Assistant</h1>
        <p class="hero-subtitle">
          Generate captions, hashtags, and SEO content for Instagram, Twitter/X, and YouTube — all from one dashboard.
        </p>
        <div class="hero-features">
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>AI caption & hashtag generation</span>
          </div>
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>Schedule posts across platforms</span>
          </div>
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>Content calendar with drag & drop</span>
          </div>
          <div class="feature-item">
            <div class="feature-check">✓</div>
            <span>Analytics & performance insights</span>
          </div>
        </div>
      </div>
    </div>
    <div class="auth-right">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;

  @media (max-width: 968px) {
    flex-direction: column;
  }
}

.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 968px) {
    display: none;
  }
}

.auth-brand {
  position: relative;
  z-index: 1;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  font-weight: 800;
  font-size: 20px;
}

.auth-hero {
  position: relative;
  z-index: 1;
  max-width: 480px;
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.85;
  margin-bottom: 40px;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  opacity: 0.9;
}

.feature-check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  font-size: 14px;
  font-weight: 700;
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8fafc;
}
</style>
