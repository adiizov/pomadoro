import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'timer',
    component: () => import('@/pages/timer/TimerPage.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
