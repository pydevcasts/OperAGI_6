<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <NuxtLink to="/dashboard" class="brand">
          <span class="brand-icon">O</span>
          <span class="brand-name">OperAGI</span>
        </NuxtLink>
        <button class="sidebar-close" @click="sidebarOpen = false">×</button>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-details">
            <div class="user-email">{{ userEmail }}</div>
            <div class="user-plan">Free Trial</div>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">Sign Out</button>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <button class="menu-btn" @click="sidebarOpen = true">
          <span></span><span></span><span></span>
        </button>
        <div class="topbar-title">{{ pageTitle }}</div>
        <div class="topbar-actions">
          <NuxtLink to="/content-generator" class="btn-new">
            <span>+</span> New Content
          </NuxtLink>
        </div>
      </header>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

const sidebarOpen = ref(false)

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/content-generator', label: 'Content Generator', icon: '✨' },
  { to: '/calendar', label: 'Content Calendar', icon: '📅' },
  { to: '/social-accounts', label: 'Social Accounts', icon: '🔗' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/pricing', label: 'Pricing', icon: '💎' },
]

const pageTitle = computed(() => {
  const item = navItems.find(i => route.path.startsWith(i.to))
  return item?.label || 'OperAGI'
})

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')

const userEmail = computed(() => auth.user?.email || 'User')
const userInitial = computed(() => {
  const email = auth.user?.email || 'U'
  return email.charAt(0).toUpperCase()
})

async function handleLogout() {
  await auth.logout()
}
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 260px;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: translateX(-100%);

    &.open {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  color: white;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  font-weight: 800;
  font-size: 18px;
}

.sidebar-close {
  display: none;
  color: white;
  font-size: 24px;

  @media (max-width: 768px) {
    display: block;
  }
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: white;
    background: rgba(37, 99, 235, 0.2);
    border-left: 3px solid #3b82f6;
    padding-left: 11px;
  }
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-email {
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: 12px;
  color: #64748b;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 55;

  @media (max-width: 768px) {
    display: block;
  }
}

.main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;

  @media (max-width: 768px) {
    margin-left: 0;
  }
}

.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 40;
}

.menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 20px;
    height: 2px;
    background: #475569;
    border-radius: 2px;
  }
}

.topbar-title {
  flex: 1;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.topbar-actions {
  display: flex;
  gap: 12px;
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #1d4ed8;
    color: white;
  }

  span {
    font-size: 18px;
    line-height: 1;
  }
}

.content {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>
