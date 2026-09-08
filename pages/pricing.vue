<template>
  <div class="pricing-page">
    <div class="page-header">
      <h1>Pricing</h1>
      <p>Choose the plan that fits your needs</p>
    </div>

    <div v-if="loading" class="pricing-grid">
      <div v-for="i in 3" :key="i" class="shimmer-card shimmer"></div>
    </div>

    <div v-else class="pricing-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="pricing-card"
        :class="{ featured: plan.name === 'Pro' }"
      >
        <div v-if="plan.name === 'Pro'" class="featured-badge">Most Popular</div>
        <div class="plan-name">{{ plan.name }}</div>
        <div class="plan-price">
          <span class="price-amount">${{ plan.price }}</span>
          <span class="price-period">/month</span>
        </div>
        <div class="plan-limits">
          <span>{{ plan.max_platforms }} platforms</span>
          <span>{{ plan.max_posts === 999999 ? 'Unlimited' : plan.max_posts }} posts/month</span>
        </div>
        <ul class="plan-features">
          <li v-for="feat in plan.features" :key="feat">{{ feat }}</li>
        </ul>
        <button
          class="btn-select"
          :class="{ current: currentPlan === plan.name }"
          @click="selectPlan(plan)"
          :disabled="currentPlan === plan.name"
        >
          {{ currentPlan === plan.name ? 'Current Plan' : 'Select Plan' }}
        </button>
      </div>
    </div>

    <div class="comparison-section">
      <h2>Plan Comparison</h2>
      <div class="comparison-table">
        <div class="comparison-row header">
          <div>Feature</div>
          <div>Starter</div>
          <div>Pro</div>
          <div>Agency</div>
        </div>
        <div v-for="row in comparisonRows" :key="row.feature" class="comparison-row">
          <div class="feat-name">{{ row.feature }}</div>
          <div>{{ row.starter }}</div>
          <div>{{ row.pro }}</div>
          <div>{{ row.agency }}</div>
        </div>
      </div>
    </div>

    <div class="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
        <div v-for="faq in faqs" :key="faq.q" class="faq-item">
          <div class="faq-q" @click="toggleFaq(faq.q)">
            <span>{{ faq.q }}</span>
            <span class="faq-toggle" :class="{ open: openFaq === faq.q }">+</span>
          </div>
          <div v-if="openFaq === faq.q" class="faq-a">{{ faq.a }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SubscriptionPlan } from '~/types'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const plans = ref<SubscriptionPlan[]>([])
const loading = ref(true)
const currentPlan = ref('Starter')
const openFaq = ref('')

const comparisonRows = [
  { feature: 'Platforms', starter: '2', pro: '3', agency: '5' },
  { feature: 'Posts/month', starter: '30', pro: '150', agency: 'Unlimited' },
  { feature: 'AI Caption Generation', starter: '✓', pro: '✓', agency: '✓' },
  { feature: 'Hashtag Suggestions', starter: '✓', pro: '✓', agency: '✓' },
  { feature: 'Content Scheduling', starter: '—', pro: '✓', agency: '✓' },
  { feature: 'Analytics Dashboard', starter: '—', pro: '✓', agency: '✓' },
  { feature: 'Thread Generator', starter: '—', pro: '✓', agency: '✓' },
  { feature: 'API Access', starter: '—', pro: '—', agency: '✓' },
  { feature: 'White-label Reports', starter: '—', pro: '—', agency: '✓' },
]

const faqs = [
  { q: 'Can I change my plan at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.' },
  { q: 'Is there a free trial?', a: 'Yes, all plans come with a 14-day free trial. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. You can cancel your subscription at any time from your dashboard. No questions asked.' },
  { q: 'Do you support Persian/Farsi content?', a: 'Yes, OperAGI supports both English and Persian (Farsi) content generation across all platforms.' },
]

function toggleFaq(q: string) {
  openFaq.value = openFaq.value === q ? '' : q
}

async function selectPlan(plan: SubscriptionPlan) {
  const { supabase } = await import('~/utils/supabase')
  const auth = useAuthStore()
  const userId = auth.user?.id
  if (!userId) return

  await supabase
    .from('payments')
    .insert({
      user_id: userId,
      plan_id: plan.id,
      amount: plan.price,
      transaction_id: `demo_${Date.now()}`,
    })

  currentPlan.value = plan.name
}

onMounted(async () => {
  const { supabase } = await import('~/utils/supabase')

  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true })

  plans.value = (data || []).map(p => ({
    ...p,
    features: Array.isArray(p.features) ? p.features : [],
  }))
  loading.value = false
})
</script>

<style lang="scss" scoped>
$primary: #2563eb;

.page-header {
  margin-bottom: 40px;
  text-align: center;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }

  p {
    font-size: 16px;
    color: #64748b;
  }
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 960px;
  margin: 0 auto 56px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.shimmer-card {
  height: 360px;
  border-radius: 20px;
}

.pricing-card {
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 32px 28px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  }

  &.featured {
    border-color: $primary;
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12);
  }
}

.featured-badge {
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

.plan-name {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.price-amount {
  font-size: 42px;
  font-weight: 800;
  color: #0f172a;
}

.price-period {
  font-size: 15px;
  color: #94a3b8;
}

.plan-limits {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 28px;

  li {
    padding: 6px 0;
    font-size: 14px;
    color: #475569;

    &::before {
      content: '✓';
      color: #22c55e;
      font-weight: 700;
      margin-right: 8px;
    }
  }
}

.btn-select {
  width: 100%;
  padding: 12px;
  background: $primary;
  color: white;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }

  &.current {
    background: #f1f5f9;
    color: #64748b;
    cursor: default;
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

.comparison-section {
  max-width: 900px;
  margin: 0 auto 56px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 24px;
    text-align: center;
  }
}

.comparison-table {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 14px 20px;
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;

  &:last-child { border-bottom: none; }

  &:nth-child(odd) {
    background: #f8fafc;
  }

  &.header {
    background: #1e293b;
    color: white;
    font-weight: 700;
  }

  div {
    text-align: center;

    &:first-child {
      text-align: left;
      font-weight: 500;
      color: #475569;
    }
  }

  .header div:first-child { color: white; }
}

.feat-name {
  font-weight: 600;
  color: #1e293b;
}

.faq-section {
  max-width: 720px;
  margin: 0 auto;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 24px;
    text-align: center;
  }
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.faq-q {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: background 0.2s;

  &:hover { background: #f8fafc; }
}

.faq-toggle {
  font-size: 22px;
  color: #94a3b8;
  transition: transform 0.2s;

  &.open { transform: rotate(45deg); }
}

.faq-a {
  padding: 0 20px 16px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}
</style>
