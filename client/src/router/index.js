import LoginView from '@/views/LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/AboutView.vue'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import TasksView from '../views/TasksView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        if (authStore.isLoggedIn) {
          // User is logged in, allow access to home
          next()
        } else {
          // User is not logged in, redirect to login
          next({ name: 'login' })
        }
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: AboutView
    },
    {
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

export default router
