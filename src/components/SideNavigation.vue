<template>
  <div>
    <div class="sidebar" :class="{ 'sidebar-collapsed': isMobileView && !isVisible }">
      <div class="sidebar-inner">
        <div class="logo">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
          </div>
          <h2>EcommerceHub</h2>
        </div>

        <div class="user-info">
          <div class="avatar">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'%3E%3Ccircle cx='22.5' cy='22.5' r='22.5' fill='%234361ee'/%3E%3Ccircle cx='22.5' cy='16' r='7' fill='%23ffffff'/%3E%3Cpath d='M22.5,45 C31,45 38,40 38,33 C38,28 31,25 22.5,25 C14,25 7,28 7,33 C7,40 14,45 22.5,45 Z' fill='%23ffffff'/%3E%3C/svg%3E" alt="User Avatar">
          </div>
          <div class="user-details">
            <h4>Admin User</h4>
            <span>Administrator</span>
          </div>
        </div>

        <nav>
          <div class="nav-section">
            <span class="section-title">Main</span>
            <ul>
              <li>
                <a href="#" @click.prevent="goTo('/')" :class="{'active': isActive('/')}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="goTo('/revenue')" :class="{'active': isActive('/revenue')}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  <span>Revenue Analysis</span>
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="goTo('/inventory')" :class="{'active': isActive('/inventory')}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <span>Inventory</span>
                </a>
              </li>
            </ul>
          </div>

          <div class="nav-section">
            <span class="section-title">Products</span>
            <ul>
              <li>
                <a href="#" @click.prevent="goTo('/products/new')" :class="{'active': isActive('/products/new')}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Add New Product</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div class="sidebar-footer">
          <button class="support-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <span>Help & Support</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideNavigation',
  props: {
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isMobileView: false,
      currentPath: window.location.pathname
    }
  },
  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);

    // Update current path when route changes
    this.$router.afterEach((to) => {
      this.currentPath = to.path;
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    checkScreenSize() {
      this.isMobileView = window.innerWidth <= 768;
    },
    goTo(path) {
      // Close sidebar on mobile before navigating
      if (this.isMobileView) {
        this.$emit('close');
      }

      // Use Vue Router for navigation instead of window.location
      this.$router.push(path);
    },
    isActive(path) {
      // Check if the current route path matches the given path
      if (this.$route) {
        return this.$route.path === path;
      }
      // Fallback to using the currentPath property
      return this.currentPath === path;
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  background: var(--sidebar-bg);
  color: var(--text-light);
  padding: 1.25rem 0;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 1200; /* Increased z-index to ensure it's above other elements */
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
  overflow-x: hidden; /* Prevent horizontal scrolling */
  will-change: transform; /* Optimize for animations */
}

/* This class only affects mobile view */
.sidebar-collapsed {
  transform: translateX(-100%);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal overflow */
  background: var(--sidebar-bg);
  width: 100%; /* Ensure content doesn't cause overflow */
}

.logo {
  padding: 0.75rem 1.5rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 1.25rem;
  position: relative;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.logo h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  letter-spacing: -0.5px;
}

.user-info {
  padding: 0 1.5rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 1.25rem;
}

.avatar img {
  width: 45px;
  height: 45px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.user-details h4 {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.user-details span {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  display: block;
}

nav {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
}

.nav-section {
  margin-bottom: 1.75rem;
}

.section-title {
  padding: 0 1.75rem;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav ul li {
  padding: 0 0.75rem;
  margin-bottom: 0.25rem;
}

nav ul li a {
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  gap: 0.875rem;
  font-weight: 400;
  text-decoration: none;
}

nav ul li a:hover {
  background: var(--sidebar-hover);
  color: white;
}

nav ul li a.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 20px;
  height: 20px;
  min-width: 20px;
}

.sidebar-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.support-btn {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  transition: all 0.2s ease;
}

.support-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .sidebar {
    z-index: 1200;
    width: 270px;
    transform: translateX(0); /* Ensure sidebar is visible when it should be */
    transition: transform 0.3s ease;
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }

  .logo h2 {
    font-size: 1.2rem;
  }

  .user-details h4 {
    font-size: 0.9rem;
  }

  nav ul li a {
    padding: 0.7rem 0.9rem;
  }

  .section-title {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 250px;
  }

  .logo {
    padding: 0.5rem 1.25rem 1.25rem;
  }

  .user-info {
    padding: 0 1.25rem 1rem;
  }

  .logo-icon {
    width: 38px;
    height: 38px;
  }

  .avatar img {
    width: 40px;
    height: 40px;
  }

  .section-title {
    padding: 0 1.5rem;
  }

  nav ul li {
    padding: 0 0.5rem;
  }

  .sidebar-footer {
    padding: 1rem 1.25rem;
  }
}
</style>