<template>
  <div class="layout-container">
    <button v-if="isMobile" @click="toggleSidebar" :class="['mobile-toggle', { active: sidebarOpen }]">
      <span></span><span></span><span></span>
    </button>

    <div v-if="isMobile && sidebarOpen" class="overlay" @click="closeSidebar"></div>

    <SideNavigation
      v-if="!isMobile || sidebarOpen"
      :isVisible="sidebarOpen"
      @close="closeSidebar"
    />

    <main :class="['main-area', { full: isMobile }]">
      <header class="top-bar">
        <h1>{{ pageTitle }}</h1>
        <div class="actions">
          <div class="search-wrap">
            <svg class="icon" viewBox="0 0 24 24"><path d="M21 21l-5.2-5.2A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z"/></svg>
            <input type="text" placeholder="Search..." />
          </div>
          <button class="icon-btn">
            <svg class="icon" viewBox="0 0 24 24"><path d="M14.86 17.08a23.85 23.85 0 005.45-1.31A9 9 0 0118 9.75v-.7V9A6 6 0 006 9v.75a9 9 0 01-2.31 6.02 24.26 24.26 0 0010.58 1.31z"/></svg>
            <span class="badge">3</span>
          </button>
          <button class="user-avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='42' height='42' viewBox='0 0 42 42'%3E%3Ccircle cx='21' cy='21' r='21' fill='%234361ee'/%3E%3Ccircle cx='21' cy='15' r='6' fill='%23ffffff'/%3E%3Cpath d='M21,42 C29,42 35,37 35,31 C35,26 29,23 21,23 C13,23 7,26 7,31 C7,37 13,42 21,42 Z' fill='%23ffffff'/%3E%3C/svg%3E" alt="User" />
          </button>
        </div>
      </header>
      <section class="page-content">
        <slot />
      </section>
    </main>
  </div>
</template>

<script>
import SideNavigation from './SideNavigation.vue'

export default {
  name: 'MainLayout',
  components: { SideNavigation },
  props: {
    pageTitle: { type: String, required: true }
  },
  data() {
    return {
      isMobile: false,
      sidebarOpen: false
    }
  },
  mounted() {
    this.updateLayout()
    window.addEventListener('resize', this.updateLayout)

    this.$router.afterEach(() => {
      if (this.isMobile) this.closeSidebar()
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateLayout)
    document.body.style.overflow = ''
  },
  methods: {
    updateLayout() {
      const wasMobile = this.isMobile
      this.isMobile = window.innerWidth <= 768
      if (wasMobile !== this.isMobile) {
        this.sidebarOpen = !this.isMobile
        document.body.style.overflow = ''
      }
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      document.body.style.overflow = this.sidebarOpen ? 'hidden' : ''
    },
    closeSidebar() {
      this.sidebarOpen = false
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  overflow-x: hidden;
}

.main-area {
  flex-grow: 1;
  margin-left: 280px;
  padding: 2rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.main-area.full {
  margin-left: 0;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e4e7ec;
  padding-bottom: 1rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-wrap {
  position: relative;
}

.search-wrap .icon {
  position: absolute;
  left: 14px;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-wrap input {
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: 9999px;
  border: 1px solid #e4e7ec;
  width: 220px;
}

.icon-btn {
  background: none;
  border: none;
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn .icon {
  width: 20px;
  height: 20px;
}

.badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #f04438;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  overflow: hidden;
  border: 2px solid #fff;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-toggle {
  position: fixed;
  top: 15px;
  left: 15px;
  width: 44px;
  height: 44px;
  background: #7f56d9;
  border-radius: 8px;
  z-index: 1300;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  border: none;
  cursor: pointer;
}

.mobile-toggle span {
  width: 22px;
  height: 2px;
  background: white;
  transition: 0.3s;
}

.mobile-toggle.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1100;
  backdrop-filter: blur(2px);
}

.page-content {
  width: 100%;
}
</style>
