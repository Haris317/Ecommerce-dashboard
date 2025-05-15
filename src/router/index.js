import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/revenue',
    name: 'Revenue',
    component: () => import('../views/RevenueAnalysis.vue')
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/InventoryManagement.vue')
  },
  {
    path: '/products/new',
    name: 'ProductRegistration',
    component: () => import('../views/ProductRegistration.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 