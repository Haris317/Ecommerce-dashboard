<script setup>
import { ref, provide } from 'vue';
import HelloWorld from './components/HelloWorld.vue'

// Notification system
const notifications = ref([]);
const notificationId = ref(0);

const showNotification = (message, type = 'success', duration = 5000) => {
  const id = notificationId.value++;
  notifications.value.push({ id, message, type, duration });

  setTimeout(() => {
    removeNotification(id);
  }, duration);

  return id;
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(note => note.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

// Provide notification methods to all components
provide('notifications', {
  show: showNotification,
  remove: removeNotification,
  list: notifications
});
</script>

<template>
  <div id="app-root">
    <div class="notifications-container">
      <div v-for="notification in notifications" :key="notification.id"
           :class="['notification', `notification-${notification.type}`]"
           @click="removeNotification(notification.id)">
        {{ notification.message }}
      </div>
    </div>
    <router-view />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

:root {
  /* Modern Vibrant Color Palette */
  --primary: #7F56D9;
  --primary-light: #9E7DD8;
  --primary-dark: #6941C6;
  --primary-bg: rgba(127, 86, 217, 0.08);

  --secondary: #0BA5EC;
  --secondary-light: #38BDF8;
  --secondary-dark: #0284C7;

  --success: #12B76A;
  --success-light: #32D583;
  --success-dark: #027A48;
  --success-bg: rgba(18, 183, 106, 0.08);

  --warning: #F79009;
  --warning-light: #FEC84B;
  --warning-dark: #B54708;
  --warning-bg: rgba(247, 144, 9, 0.08);

  --danger: #F04438;
  --danger-light: #FDA29B;
  --danger-dark: #B42318;
  --danger-bg: rgba(240, 68, 56, 0.08);

  --neutral-50: #F9FAFB;
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;
  --neutral-600: #4B5563;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --neutral-900: #111827;

  /* Core UI Colors */
  --body-bg: #F9FAFC;
  --card-bg: #FFFFFF;
  --sidebar-bg: linear-gradient(145deg, #7F56D9, #6941C6);
  --sidebar-hover: rgba(255, 255, 255, 0.15);

  /* Text Colors */
  --text-main: #101828;
  --text-muted: #667085;
  --text-light: #FFFFFF;

  /* Borders and Shadows */
  --border-color: #E4E7EC;
  --shadow-xs: 0px 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-sm: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06);
  --shadow-lg: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  --shadow-xl: 0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03);
  --shadow-2xl: 0px 24px 48px -12px rgba(16, 24, 40, 0.18);

  /* Border Radius */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;

  /* Spacing */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */

  /* Transitions */
  --transition-normal: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
  background-color: var(--body-bg);
  color: var(--text-main);
  line-height: 1.5;
  font-size: 0.9375rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

a {
  text-decoration: none;
  color: inherit;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

h4 {
  font-size: 1.125rem;
  font-weight: 600;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
}

button {
  cursor: pointer;
}

/* Modern card styling */
.card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
  border: 1px solid var(--neutral-100);
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* Modern button styling */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  transition: var(--transition-normal);
  cursor: pointer;
  border: none;
  font-size: 0.875rem;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn:hover::before {
  opacity: 1;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
}

.btn-secondary {
  background: var(--secondary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--secondary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(11, 165, 236, 0.3);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-warning {
  background: var(--warning);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
  background-color: var(--primary-bg);
}

/* Text utilities */
.text-success {
  color: var(--success);
}

.text-danger {
  color: var(--danger);
}

.text-warning {
  color: var(--warning);
}

.text-primary {
  color: var(--primary);
}

.text-secondary {
  color: var(--secondary);
}

/* Form elements */
input, select, textarea {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  color: var(--text-main);
  background-color: white;
  font-size: 0.875rem;
}

input::placeholder,
select::placeholder,
textarea::placeholder {
  color: var(--text-muted);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 4px rgba(127, 86, 217, 0.15);
}

/* Tables */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  font-weight: 600;
  text-align: left;
  color: var(--text-muted);
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--neutral-50);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
}

/* Badge styling */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.badge-success {
  background-color: var(--success-bg);
  color: var(--success);
}

.badge-warning {
  background-color: var(--warning-bg);
  color: var(--warning);
}

.badge-danger {
  background-color: var(--danger-bg);
  color: var(--danger);
}

.badge-primary {
  background-color: var(--primary-bg);
  color: var(--primary);
}

/* Responsive typography */
@media (max-width: 768px) {
  body {
    font-size: 0.875rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  h3 {
    font-size: 1.125rem;
  }

  h4 {
    font-size: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.813rem;
  }
}

@media (max-width: 576px) {
  h1 {
    font-size: 1.375rem;
  }

  .card {
    border-radius: var(--radius-lg);
  }

  .modal {
    border-radius: var(--radius-lg);
  }
}

/* Notification System */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

.notification {
  padding: 15px 20px;
  border-radius: var(--radius-md);
  color: white;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  animation: slideIn 0.3s ease-out forwards;
  position: relative;
  overflow: hidden;
}

.notification::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: rgba(255, 255, 255, 0.4);
  animation: countdown linear forwards;
  animation-duration: inherit;
}

.notification-success {
  background-color: var(--success);
}

.notification-error {
  background-color: var(--danger);
}

.notification-warning {
  background-color: var(--warning);
}

.notification-info {
  background-color: var(--secondary);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

#app-root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--body-bg);
}
</style>
