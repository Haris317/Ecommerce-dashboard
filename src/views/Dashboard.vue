<template>
  <MainLayout pageTitle="Dashboard Overview">
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon orders">
          <span>🛒</span>
        </div>
        <div class="stat-details">
          <h3>Total Orders</h3>
          <div class="metric">{{ totalOrders }}</div>
          <div class="trend positive">
            <span class="trend-arrow">↑</span> 8% from last month
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <span>💰</span>
        </div>
        <div class="stat-details">
          <h3>Total Revenue</h3>
          <div class="metric">${{ totalRevenue.toLocaleString() }}</div>
          <div class="trend positive">
            <span class="trend-arrow">↑</span> 12% from last month
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon products">
          <span>📦</span>
        </div>
        <div class="stat-details">
          <h3>Products in Stock</h3>
          <div class="metric">{{ totalProducts }}</div>
          <div class="trend negative">
            <span class="trend-arrow">↓</span> 3% from last month
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon alerts">
          <span>⚠️</span>
        </div>
        <div class="stat-details">
          <h3>Low Stock Alerts</h3>
          <div class="metric">{{ lowStockCount }}</div>
          <div class="trend neutral">No change</div>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="chart-container">
        <div class="chart-header">
          <h3>Revenue Overview</h3>
          <div class="chart-actions">
            <button
              @click="setChartPeriod('daily')"
              :class="['chart-period', { active: chartPeriod === 'daily' }]"
            >
              Daily
            </button>
            <button
              @click="setChartPeriod('weekly')"
              :class="['chart-period', { active: chartPeriod === 'weekly' }]"
            >
              Weekly
            </button>
            <button
              @click="setChartPeriod('monthly')"
              :class="['chart-period', { active: chartPeriod === 'monthly' }]"
            >
              Monthly
            </button>
          </div>
        </div>
        <div class="chart">
          <line-chart :key="chartKey" :chart-data="currentChartData" :options="chartOptions" />
        </div>
      </div>

      <div class="top-products-container">
        <div class="section-header">
          <h3>Top Selling Products</h3>
          <button @click="navigateToInventory()" class="see-all-btn">See All</button>
        </div>
        <div class="product-list">
          <div v-for="product in topProducts" :key="product.id" class="product-item">
            <div class="product-image">
              <img v-if="product.image" :src="product.image" alt="Product thumbnail" />
              <img v-else src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23cccccc'/%3E%3C/svg%3E" :alt="product.name" />
            </div>
            <div class="product-details">
              <h4>{{ product.name }}</h4>
              <p>{{ product.category }}</p>
            </div>
            <div class="product-stats">
              <div class="stat-value">{{ product.sold }} sold</div>
              <div class="stat-bar">
                <div class="bar-fill" :style="{ width: `${(product.sold / maxSold) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="recent-orders-container">
      <div class="section-header">
        <h3>Recent Orders</h3>
        <button @click="navigateToRevenue()" class="see-all-btn">View All Orders</button>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td data-label="Order ID">{{ order.id }}</td>
              <td data-label="Customer">
                <div class="customer-cell">
                  <div class="avatar">{{ getInitials(order.customer) }}</div>
                  <span>{{ order.customer }}</span>
                </div>
              </td>
              <td data-label="Products">{{ order.product }}</td>
              <td data-label="Amount">${{ order.amount }}</td>
              <td data-label="Status"><span :class="['status-badge', order.status.toLowerCase()]">{{ order.status }}</span></td>
              <td data-label="Actions">
                <button @click="viewOrder(order)" class="action-btn">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedOrder" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Order Details</h3>
          <button @click="selectedOrder = null" class="close-button">✕</button>
        </div>
        <div class="modal-content">
          <div class="order-details">
            <div class="detail-row">
              <div class="detail-label">Order ID:</div>
              <div class="detail-value">{{ selectedOrder.id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Customer:</div>
              <div class="detail-value">{{ selectedOrder.customer }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Product:</div>
              <div class="detail-value">{{ selectedOrder.product }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Amount:</div>
              <div class="detail-value">${{ selectedOrder.amount }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Status:</div>
              <div class="detail-value">
                <span :class="['status-badge', selectedOrder.status.toLowerCase()]">
                  {{ selectedOrder.status }}
                </span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date:</div>
              <div class="detail-value">{{ formatDate(selectedOrder.date) }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button v-if="selectedOrder.status !== 'Delivered'" @click="updateOrderStatus" class="update-status-btn">
            {{ getNextStatus(selectedOrder.status) }}
          </button>
          <button @click="selectedOrder = null" class="close-btn">Close</button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script>
import MainLayout from '../components/MainLayout.vue'
import LineChart from '../components/LineChart.vue'
import { products } from '../data/products'
import { orders } from '../data/orders'
import { revenueData } from '../data/revenue'
import { defaultOptions, safeChartDataCopy } from '../utils/chartConfig'

export default {
  name: 'Dashboard',
  components: {
    MainLayout,
    LineChart
  },
  data() {
    return {
      products,
      orders,
      revenueData,
      chartPeriod: 'daily',
      chartKey: 0,
      selectedOrder: null,
      topProducts: [
        { id: 'P001', name: 'Smartphone X', category: 'Electronics', sold: 124, image: null },
        { id: 'P002', name: 'Laptop Pro', category: 'Electronics', sold: 98, image: null },
        { id: 'P003', name: 'Wireless Earbuds', category: 'Electronics', sold: 243, image: null }
      ]
    }
  },
  computed: {
    totalOrders() {
      return this.orders.length
    },
    totalRevenue() {
      return this.orders.reduce((sum, order) => sum + order.amount, 0)
    },
    totalProducts() {
      return this.products.length
    },
    lowStockCount() {
      return this.products.filter(product => product.stock <= 15).length
    },
    currentChartData() {
      try {
        const periodData = this.revenueData[this.chartPeriod];
        if (!periodData) {
          console.error('Missing chart data for period:', this.chartPeriod);
          return { labels: [], datasets: [] };
        }
        return safeChartDataCopy(periodData);
      } catch (error) {
        console.error('Error creating chart data:', error);
        return { labels: [], datasets: [] };
      }
    },
    chartOptions() {
      return defaultOptions;
    },
    recentOrders() {
      // Sort orders by date, newest first
      return [...this.orders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3) // Only show 3 most recent orders
    },
    maxSold() {
      return Math.max(...this.topProducts.map(p => p.sold))
    }
  },
  methods: {
    setChartPeriod(period) {
      if (this.chartPeriod === period) return;

      this.chartPeriod = period;
      this.chartKey++; // Force chart re-render
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    getInitials(name) {
      return name.split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
    },
    viewOrder(order) {
      // Set the selected order to display in the modal
      this.selectedOrder = { ...order };
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    getNextStatus(currentStatus) {
      const statusFlow = {
        'Processing': 'Mark as Shipped',
        'Shipped': 'Mark as Delivered'
      }
      return statusFlow[currentStatus] || 'Update Status'
    },
    updateOrderStatus() {
      const statusFlow = {
        'Processing': 'Shipped',
        'Shipped': 'Delivered'
      }

      const newStatus = statusFlow[this.selectedOrder.status]
      if (newStatus) {
        // Update the order status in the orders array
        const orderIndex = this.orders.findIndex(o => o.id === this.selectedOrder.id)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = newStatus
          this.selectedOrder.status = newStatus
        }
      }
    },
    navigateToInventory() {
      this.$router.push('/inventory');
    },
    navigateToRevenue() {
      this.$router.push('/revenue');
    }
  },
  mounted() {
    // Initialize chart
    this.chartKey = 1;

    // Match products with their images
    this.topProducts = this.topProducts.map(tp => {
      const productData = this.products.find(p => p.id === tp.id)
      if (productData && productData.image) {
        return { ...tp, image: productData.image }
      }
      return tp
    })
  }
}
</script>

<style scoped>
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.75rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.orders {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.stat-icon.revenue {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.stat-icon.products {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.stat-icon.alerts {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.stat-details {
  flex: 1;
}

.stat-details h3 {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.metric {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.trend {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.trend-arrow {
  font-weight: bold;
}

.trend.positive {
  color: var(--success);
}

.trend.negative {
  color: var(--danger);
}

.trend.neutral {
  color: var(--text-muted);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-container, .top-products-container, .recent-orders-container {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.75rem;
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.chart-container:hover, .top-products-container:hover, .recent-orders-container:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.chart {
  width: 100%;
  height: 300px;
  position: relative;
}

.chart-header, .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3, .section-header h3 {
  font-size: 1.125rem;
  margin: 0;
  color: var(--text-main);
  font-weight: 600;
}

.chart-actions {
  display: flex;
  gap: 0.5rem;
}

.chart-period {
  background: none;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
  font-weight: 500;
}

.chart-period:hover {
  background-color: rgba(99, 102, 241, 0.05);
  color: var(--primary);
}

.chart-period.active {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.chart {
  height: 300px;
  position: relative;
}

.see-all-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-full);
}

.see-all-btn:hover {
  background-color: rgba(99, 102, 241, 0.05);
  transform: translateY(-2px);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.product-item:hover {
  background-color: rgba(248, 250, 252, 0.8);
  transform: translateX(4px);
}

.product-image img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.product-details {
  flex: 1;
}

.product-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.product-details p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.product-stats {
  width: 100px;
}

.stat-value {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.stat-bar {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  border-radius: var(--radius-full);
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

th {
  padding: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(248, 250, 252, 0.5);
}

td {
  padding: 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.delivered {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-badge.processing {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.status-badge.shipped {
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.action-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.action-btn:hover {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: var(--radius-lg);
  width: 500px;
  max-width: 90%;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.close-button:hover {
  color: var(--text-main);
}

.modal-content {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
}

.detail-label {
  width: 120px;
  font-weight: 500;
  color: var(--text-muted);
}

.detail-value {
  color: var(--text-main);
  font-weight: 500;
}

.modal-footer {
  padding: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border-color);
}

.update-status-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.update-status-btn:hover {
  background-color: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

.close-btn {
  background-color: var(--body-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: white;
  box-shadow: var(--shadow-sm);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .chart-container, .top-products-container, .recent-orders-container {
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .chart {
    height: 220px;
  }

  .table-container {
    overflow-x: auto;
  }
}

@media (max-width: 576px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .chart-container, .top-products-container, .recent-orders-container {
    padding: 1rem;
  }

  .chart {
    height: 200px;
  }

  .table-container {
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  /* Mobile-optimized table */
  .table-container {
    margin: 0 -0.75rem; /* Extend table container past padding */
    width: calc(100% + 1.5rem);
  }

  table {
    min-width: auto; /* Allow table to be as narrow as its container */
    width: 100%;
    display: block; /* Change table display behavior */
  }

  /* Convert table to a card-like display for very small screens */
  thead {
    display: none; /* Hide table header on very small screens */
  }

  tbody {
    display: block;
    width: 100%;
  }

  tr {
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    border-bottom: 1px solid var(--border-color);
    position: relative;
    margin-bottom: 10px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: var(--radius-md);
  }

  td {
    display: flex;
    padding: 6px 0;
    border-bottom: none;
    font-size: 0.85rem;
    position: relative;
    align-items: center;
  }

  /* Add labels for data */
  td:before {
    content: attr(data-label);
    font-weight: 600;
    width: 40%;
    margin-right: 10px;
  }

  /* Special handling for customer cell in mobile view */
  .customer-cell {
    width: 100%;
  }

  /* Add some spacing for the action button */
  td:last-child {
    margin-top: 8px;
    justify-content: flex-end;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>