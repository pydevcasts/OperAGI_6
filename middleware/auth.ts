export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (auth.loading) {
    return
  }

  const publicRoutes = ['/login', '/register', '/pricing', '/']
  const isPublic = publicRoutes.includes(to.path)

  if (!auth.isAuthenticated && !isPublic) {
    return navigateTo('/login')
  }

  if (auth.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})
