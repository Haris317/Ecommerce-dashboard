<template>
  <div v-if="isOpen" class="overlay" @click="closeNav">
    <nav class="drawer" @click.stop>
      <div class="drawer-header">
        <h2>Menu</h2>
        <button class="close" @click="closeNav">✕</button>
      </div>

      <ul class="nav-links">
        <li><router-link to="/" @click="closeNav">Dashboard</router-link></li>
        <li><router-link to="/revenue" @click="closeNav">Revenue Analysis</router-link></li>
        <li><router-link to="/inventory" @click="closeNav">Inventory</router-link></li>
        <li><router-link to="/products/new" @click="closeNav">Add New Product</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'MobileNav',
  props: {
    isOpen: Boolean
  },
  emits: ['close'],
  methods: {
    closeNav() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  display: flex;
}

.drawer {
  width: 260px;
  height: 100%;
  background: linear-gradient(145deg, #7f56d9, #6941c6);
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  z-index: 1002;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.drawer-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 1rem;
}

.nav-links li {
  margin-bottom: 0.5rem;
}

.nav-links a {
  display: block;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s;
}

.nav-links a:hover {
  background: rgba(255, 255, 255, 0.15);
}

.nav-links a.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}
</style>
