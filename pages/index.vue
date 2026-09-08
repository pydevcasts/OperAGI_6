<template>
  <div>
    <!-- Navigation -->
    <nav class="nav">
      <div class="nav-container">
        <NuxtLink to="/" class="nav-brand">
          <span class="brand-icon">O</span>
          <span>OperAGI</span>
        </NuxtLink>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#pricing" class="nav-link">Pricing</a>
          <NuxtLink to="/login" class="nav-link">Sign In</NuxtLink>
          <NuxtLink to="/register" class="btn-primary">Get Started</NuxtLink>
        </div>
        <button class="nav-toggle" @click="mobileOpen = !mobileOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div v-if="mobileOpen" class="nav-mobile">
        <a href="#features" @click="mobileOpen = false">Features</a>
        <a href="#pricing" @click="mobileOpen = false">Pricing</a>
        <NuxtLink to="/login" @click="mobileOpen = false">Sign In</NuxtLink>
        <NuxtLink to="/register" @click="mobileOpen = false">Get Started</NuxtLink>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-container">
        <div class="hero-badge">AI-Powered Content Assistant</div>
        <h1 class="hero-title">
          Create better content.<br />
          <span class="gradient-text">Post smarter.</span>
        </h1>
        <p class="hero-desc">
          OperAGI helps influencers generate captions, hashtags, and SEO content for
          Instagram, Twitter/X, and YouTube — all from a single dashboard powered by AI.
        </p>
        <div class="hero-actions">
          <NuxtLink to="/register" class="btn-primary btn-lg">Start Free Trial</NuxtLink>
          <NuxtLink to="/pricing" class="btn-outline btn-lg">View Pricing</NuxtLink>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">3</span><span class="stat-label">Platforms</span></div>
          <div class="stat"><span class="stat-num">AI</span><span class="stat-label">Content Gen</span></div>
          <div class="stat"><span class="stat-num">∞</span><span class="stat-label">Scheduling</span></div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Everything you need to grow</h2>
        <p class="section-sub">One dashboard for all your content needs</p>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card">
            <div class="feature-icon" :style="{ background: f.bg }">{{ f.emoji }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Platforms -->
    <section class="platforms">
      <div class="container">
        <h2 class="section-title">Works with your favorite platforms</h2>
        <div class="platforms-grid">
          <div v-for="p in platforms" :key="p.name" class="platform-card">
            <div class="platform-icon" :style="{ background: p.color }">{{ p.icon }}</div>
            <h3>{{ p.name }}</h3>
            <p>{{ p.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="pricing-section">
      <div class="container">
        <h2 class="section-title">Simple, transparent pricing</h2>
        <p class="section-sub">Start free, upgrade when you grow</p>
        <div class="pricing-grid">
          <div v-for="plan in pricingPlans" :key="plan.name" class="pricing-card" :class="{ featured: plan.featured }">
            <div v-if="plan.featured" class="pricing-badge">Most Popular</div>
            <h3>{{ plan.name }}</h3>
            <div class="price"><span class="price-amount">${{ plan.price }}</span><span class="price-period">/month</span></div>
            <ul class="price-features">
              <li v-for="feat in plan.features" :key="feat">{{ feat }}</li>
            </ul>
            <NuxtLink to="/register" class="btn-primary w-full">Get Started</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container">
        <h2>Ready to transform your content?</h2>
        <p>Join OperAGI today and let AI handle the heavy lifting.</p>
        <NuxtLink to="/register" class="btn-primary btn-lg">Start Free Trial</NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-brand">
          <span class="brand-icon">O</span>
          <span>OperAGI</span>
        </div>
        <p>&copy; 2026 OperAGI. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false)

const features = [
  { emoji: '✨', title: 'AI Caption Generation', desc: 'Generate engaging captions in Persian and English with Claude AI.', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  { emoji: '#', title: 'Smart Hashtags', desc: 'Get SEO-optimized hashtag suggestions tailored to your content.', bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { emoji: '📅', title: 'Content Calendar', desc: 'Schedule and manage posts with an intuitive drag & drop calendar.', bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  { emoji: '📊', title: 'Analytics', desc: 'Compare performance across platforms and track your growth.', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { emoji: '🧵', title: 'Thread Generator', desc: 'Convert Instagram posts into Twitter threads automatically.', bg: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { emoji: '🎬', title: 'YouTube SEO', desc: 'Generate titles, descriptions, and tags optimized for search.', bg: 'linear-gradient(135deg, #ef4444, #dc2626)' },
]

const platforms = [
  { name: 'Instagram', icon: '📷', color: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', desc: 'Captions, hashtags, and optimal posting times.' },
  { name: 'Twitter/X', icon: '🐦', color: 'linear-gradient(135deg, #1d9bf0, #0c7abf)', desc: 'Tweets, threads, and content repurposing.' },
  { name: 'YouTube', icon: '▶', color: 'linear-gradient(135deg, #ff0000, #cc0000)', desc: 'SEO titles, descriptions, and video tags.' },
]

const pricingPlans = [
  { name: 'Starter', price: 19, featured: false, features: ['2 platforms', '30 posts/month', 'Caption generation', 'Hashtag suggestions'] },
  { name: 'Pro', price: 49, featured: true, features: ['3 platforms', '150 posts/month', 'Scheduling', 'Analytics', 'Thread generation'] },
  { name: 'Agency', price: 99, featured: false, features: ['5 accounts', 'Unlimited posts', 'API access', 'White-label reports'] },
]
</script>

<style lang="scss" scoped>
$primary: #2563eb;
$primary-dark: #1d4ed8;
$accent: #f97316;

.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  color: #1e293b;
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

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;

  @media (max-width: 768px) {
    display: none;
  }
}

.nav-link {
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;

  &:hover { color: $primary; }
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 24px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
  }
}

.nav-mobile {
  display: none;
  flex-direction: column;
  padding: 16px 24px;
  gap: 16px;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    display: flex;
  }

  a {
    color: #64748b;
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
  font-size: 15px;
  transition: all 0.2s;

  &:hover {
    background: $primary-dark;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  color: #1e293b;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s;

  &:hover {
    border-color: $primary;
    color: $primary;
  }
}

.btn-lg {
  padding: 14px 32px;
  font-size: 16px;
}

.w-full { width: 100%; }

.hero {
  position: relative;
  padding: 100px 24px 120px;
  text-align: center;
  overflow: hidden;
  background: #f8fafc;
}

.hero-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(249, 115, 22, 0.08) 0%, transparent 50%);
}

.hero-container {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(37, 99, 235, 0.1);
  color: $primary;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 36px;
  }
}

.hero-desc {
  font-size: 18px;
  line-height: 1.7;
  color: #64748b;
  margin-bottom: 40px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 64px;
}

.hero-stats {
  display: flex;
  gap: 48px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 32px;
  font-weight: 800;
  color: $primary;
}

.stat-label {
  font-size: 14px;
  color: #94a3b8;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  color: #0f172a;
  margin-bottom: 12px;
}

.section-sub {
  font-size: 16px;
  text-align: center;
  color: #94a3b8;
  margin-bottom: 56px;
}

.features {
  padding: 100px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 16px 0 8px;
  }

  p {
    font-size: 15px;
    line-height: 1.6;
    color: #64748b;
  }
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  font-size: 28px;
  color: white;
}

.platforms {
  padding: 100px 0;
  background: white;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.platform-card {
  text-align: center;
  padding: 40px 24px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 16px 0 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
  }
}

.platform-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  font-size: 32px;
  margin: 0 auto;
}

.pricing-section {
  padding: 100px 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 960px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.pricing-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }

  &.featured {
    border-color: $primary;
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15);
  }

  h3 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }
}

.pricing-badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: $primary;
  color: white;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 24px;
}

.price-amount {
  font-size: 44px;
  font-weight: 800;
  color: #0f172a;
}

.price-period {
  font-size: 16px;
  color: #94a3b8;
}

.price-features {
  list-style: none;
  padding: 0;
  margin-bottom: 32px;

  li {
    padding: 8px 0;
    font-size: 15px;
    color: #475569;

    &::before {
      content: '✓';
      color: #22c55e;
      font-weight: 700;
      margin-right: 8px;
    }
  }
}

.cta {
  padding: 100px 24px;
  text-align: center;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: white;

  h2 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  p {
    font-size: 18px;
    opacity: 0.85;
    margin-bottom: 32px;
  }

  .btn-primary {
    background: white;
    color: $primary;

    &:hover {
      background: white;
      color: $primary-dark;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }
}

.footer {
  padding: 48px 24px;
  background: #0f172a;
  color: #94a3b8;
  text-align: center;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    font-size: 20px;
    color: white;
  }

  p {
    font-size: 14px;
  }
}
</style>
