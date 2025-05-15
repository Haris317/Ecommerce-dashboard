<template>
  <MainLayout pageTitle="Revenue Analysis">
    <div class="filters">
      <div class="filter-row">
        <div class="filter-group">
          <label>Time Period</label>
          <select v-model="selectedTimePeriod" @change="updateCharts">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Category</label>
          <select v-model="selectedCategory" @change="updateCharts">
            <option value="all">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div class="filter-group date-range">
          <label>Date Range</label>
          <div class="date-inputs">
            <input
              type="date"
              v-model="dateRange.start"
              :max="dateRange.end"
              @change="onDateRangeChange"
            />
            <span class="date-separator">to</span>
            <input
              type="date"
              v-model="dateRange.end"
              :min="dateRange.start"
              @change="onDateRangeChange"
            />
          </div>
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label>Compare with</label>
          <select v-model="comparisonPeriod" @change="updateCharts">
            <option value="none">No Comparison</option>
            <option value="previous">Previous Period</option>
            <option value="year">Same Period Last Year</option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="applyFilters" class="apply-button">Apply Filters</button>
          <button @click="exportData" class="export-button">
            <span class="icon">📊</span> Export
          </button>
        </div>
      </div>
    </div>

    <div class="metrics-row">
      <div class="metric-card">
        <h3>Total Revenue</h3>
        <div class="amount">{{ formatCurrency(metrics.revenue.current) }}</div>
        <div :class="['trend', getTrendClass(metrics.revenue.change)]">
          <span class="trend-arrow">{{ getTrendArrow(metrics.revenue.change) }}</span>
          {{ Math.abs(metrics.revenue.change).toFixed(1) }}% vs {{ getComparisonLabel() }}
        </div>
      </div>
      <div class="metric-card">
        <h3>Total Orders</h3>
        <div class="amount">{{ formatNumber(metrics.orders.current) }}</div>
        <div :class="['trend', getTrendClass(metrics.orders.change)]">
          <span class="trend-arrow">{{ getTrendArrow(metrics.orders.change) }}</span>
          {{ Math.abs(metrics.orders.change).toFixed(1) }}% vs {{ getComparisonLabel() }}
        </div>
      </div>
      <div class="metric-card">
        <h3>Average Order Value</h3>
        <div class="amount">{{ formatCurrency(metrics.aov.current) }}</div>
        <div :class="['trend', getTrendClass(metrics.aov.change)]">
          <span class="trend-arrow">{{ getTrendArrow(metrics.aov.change) }}</span>
          {{ Math.abs(metrics.aov.change).toFixed(1) }}% vs {{ getComparisonLabel() }}
        </div>
      </div>
      <div class="metric-card">
        <h3>Forecast (Next Period)</h3>
        <div class="amount">{{ formatCurrency(forecastData.revenue) }}</div>
        <div class="trend forecast">
          <span class="trend-arrow">{{ getTrendArrow(forecastData.change) }}</span>
          {{ Math.abs(forecastData.change).toFixed(1) }}% projected growth
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>Revenue Trends</h3>
      <div class="chart-container" ref="revenueChartContainer">
        <div v-if="isChartLoading" class="loading-chart">Loading chart...</div>
        <div v-else-if="chartError" class="chart-error">Failed to load chart. Try refreshing.</div>
        <div v-else class="chart-wrapper">
          <line-chart v-if="showCharts" :key="`revenue-${chartKey}`" :chart-data="revenueChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>Category Performance</h3>
      <div class="chart-container" ref="categoryChartContainer">
        <div v-if="isChartLoading" class="loading-chart">Loading chart...</div>
        <div v-else-if="chartError" class="chart-error">Failed to load chart. Try refreshing.</div>
        <div v-else class="chart-wrapper">
          <line-chart v-if="showCharts" :key="`category-${chartKey}`" :chart-data="categoryChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>Revenue Forecast</h3>
      <div class="chart-container" ref="forecastChartContainer">
        <div v-if="isChartLoading" class="loading-chart">Loading chart...</div>
        <div v-else-if="chartError" class="chart-error">Failed to load chart. Try refreshing.</div>
        <div v-else class="chart-wrapper">
          <line-chart v-if="showCharts" :key="`forecast-${chartKey}`" :chart-data="forecastChartData" :options="forecastChartOptions" />
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>Payment Method Analysis</h3>
      <div class="chart-container" ref="paymentChartContainer">
        <div v-if="isChartLoading" class="loading-chart">Loading chart...</div>
        <div v-else-if="chartError" class="chart-error">Failed to load chart. Try refreshing.</div>
        <div v-else class="chart-wrapper">
          <line-chart v-if="showCharts" :key="`payment-${chartKey}`" :chart-data="paymentChartData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <div class="top-products">
      <h3>Top Selling Products</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Units Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td data-label="Product">{{ product.name }}</td>
            <td data-label="Category">{{ product.category }}</td>
            <td data-label="Units Sold">{{ product.sold }}</td>
            <td data-label="Revenue">${{ formatNumber(product.revenue) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </MainLayout>
</template>

<script>
import { inject, nextTick, onMounted, onBeforeUnmount, ref } from 'vue';
import MainLayout from '../components/MainLayout.vue'
import LineChart from '../components/LineChart.vue'
import { revenueData } from '../data/revenue'
import { products } from '../data/products'
import { orders } from '../data/orders'
import { defaultOptions, safeChartDataCopy, getResponsiveOptions, simplifyChartDataForMobile } from '../utils/chartConfig'
import { logChartInfo, addDebugOutlines, simulateMobileScreen } from '../utils/debug'
import {
  formatDate,
  getDateRange,
  calculatePercentageChange,
  formatCurrency,
  generateForecast,
  groupOrdersByPeriod,
  generatePeriodComparison
} from '../utils/revenueAnalysis'

export default {
  name: 'RevenueAnalysis',
  components: {
    MainLayout,
    LineChart
  },
  setup() {
    const notifications = inject('notifications');
    return { notifications };
  },
  data() {
    // Get current date and 30 days ago for default date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Format dates for input fields
    const formatDateForInput = (date) => {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };

    return {
      selectedTimePeriod: 'monthly',
      selectedCategory: 'all',
      comparisonPeriod: 'previous',
      revenueData,
      products,
      orders,
      categories: ['Electronics', 'Clothing', 'Home Goods', 'Accessories'],
      dateRange: {
        start: formatDateForInput(thirtyDaysAgo),
        end: formatDateForInput(today)
      },
      metrics: {
        revenue: { current: 0, previous: 0, change: 0 },
        orders: { current: 0, previous: 0, change: 0 },
        aov: { current: 0, previous: 0, change: 0 }
      },
      forecastData: {
        revenue: 0,
        orders: 0,
        change: 0,
        nextPeriod: ''
      },
      paymentMethods: [
        { method: 'Credit Card', percentage: 65, color: '#42b983' },
        { method: 'PayPal', percentage: 20, color: '#2196f3' },
        { method: 'Bank Transfer', percentage: 10, color: '#ff9800' },
        { method: 'Other', percentage: 5, color: '#9c27b0' }
      ],
      chartKey: 0,
      showCharts: false,
      isChartLoading: true,
      chartError: false,
      loadAttempts: 0,
      maxLoadAttempts: 3,
      isSmallScreen: window.innerWidth < 768,
      isMediumScreen: window.innerWidth >= 768 && window.innerWidth < 1024,
      resizeTimer: null,
      chartDataCache: {
        revenue: {},
        category: {},
        forecast: {},
        payment: {}
      },
      topProducts: [
        { id: 'P001', name: 'Smartphone X', category: 'Electronics', sold: 124, revenue: 111476 },
        { id: 'P002', name: 'Laptop Pro', category: 'Electronics', sold: 98, revenue: 127302 },
        { id: 'P003', name: 'Wireless Earbuds', category: 'Electronics', sold: 243, revenue: 31347 },
        { id: 'P004', name: 'Designer Watch', category: 'Accessories', sold: 87, revenue: 21750 },
        { id: 'P005', name: 'Running Shoes', category: 'Clothing', sold: 156, revenue: 18720 }
      ]
    }
  },
  computed: {
    filteredProducts() {
      if (this.selectedCategory === 'all') {
        return this.topProducts;
      }
      return this.topProducts.filter(p => p.category === this.selectedCategory);
    },
    totalRevenue() {
      return this.filteredProducts.reduce((sum, product) => sum + product.revenue, 0);
    },
    totalOrders() {
      return this.filteredProducts.reduce((sum, product) => sum + product.sold, 0);
    },
    averageOrderValue() {
      return this.totalRevenue / this.totalOrders || 0;
    },
    forecastChartData() {
      try {
        // Use cached data if available
        const cacheKey = `${this.selectedTimePeriod}-${this.selectedCategory}`;
        if (this.chartDataCache.forecast[cacheKey]) {
          return this.chartDataCache.forecast[cacheKey];
        }

        // Get the period data
        let period = this.revenueData[this.selectedTimePeriod];

        // Fallback to monthly if the selected period doesn't exist
        if (!period || !period.datasets || !period.datasets[0]) {
          console.warn(`Missing period data for ${this.selectedTimePeriod}, falling back to monthly for forecast`);
          period = this.revenueData.monthly;

          // If still no valid data, generate default data
          if (!period || !period.datasets || !period.datasets[0]) {
            console.warn('No valid data for forecast, generating default data');

            // Generate default period data based on time period
            let labels;
            switch(this.selectedTimePeriod) {
              case 'daily':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;
              case 'weekly':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                break;
              case 'quarterly':
                labels = ['Q1', 'Q2', 'Q3', 'Q4'];
                break;
              case 'yearly':
                labels = ['2020', '2021', '2022', '2023'];
                break;
              default:
                labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            }

            // Generate some reasonable revenue data
            const baseValue = 50000;
            const revenueData = labels.map((_, index) => {
              // Create a slightly increasing trend
              return baseValue + (index * 5000) + (Math.random() * 10000);
            });

            period = {
              labels,
              datasets: [
                {
                  label: 'Revenue',
                  data: revenueData
                }
              ]
            };
          }
        }

        // Get revenue data from the first dataset
        let revenueData = [...period.datasets[0].data];

        // Apply category filter if needed
        if (this.selectedCategory !== 'all') {
          // Find the category ratio based on our product data
          const categoryProducts = this.topProducts.filter(p => p.category === this.selectedCategory);
          const totalRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0);
          const totalProducts = this.topProducts.reduce((sum, p) => sum + p.revenue, 0);

          // Default to 0.25 (25%) if we can't calculate a ratio
          const ratioToTotal = totalProducts > 0 ?
            (totalRevenue / totalProducts) : 0.25;

          // Ensure ratio is reasonable (between 0.1 and 0.9)
          const safeRatio = Math.max(0.1, Math.min(0.9, ratioToTotal));

          // Apply the ratio to the revenue data
          revenueData = revenueData.map(val => Math.round(val * safeRatio));
        }

        // Generate forecast for next 3 periods
        const forecastValues = generateForecast(revenueData, 3);

        // Create labels for forecast periods
        const lastLabel = period.labels[period.labels.length - 1];
        const forecastLabels = this.generateForecastLabels(lastLabel, 3);

        // Combine historical and forecast data
        const chartData = {
          labels: [...period.labels, ...forecastLabels],
          datasets: [
            {
              label: 'Historical Revenue',
              data: [...revenueData, null, null, null], // Add nulls for forecast period
              backgroundColor: 'rgba(66, 185, 131, 0.2)',
              borderColor: '#42b983',
              borderWidth: 2,
              pointRadius: 4
            },
            {
              label: 'Forecast Revenue',
              data: [...Array(revenueData.length).fill(null), ...forecastValues], // Add nulls for historical period
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              borderColor: '#ff9800',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 4
            }
          ]
        };

        // Simplify data for small screens if needed
        const finalChartData = this.isSmallScreen
          ? simplifyChartDataForMobile(chartData)
          : chartData;

        // Cache the data
        this.chartDataCache.forecast[cacheKey] = finalChartData;
        return finalChartData;
      } catch (error) {
        console.error('Error creating forecast chart data:', error);
        return { labels: [], datasets: [] };
      }
    },
    forecastChartOptions() {
      const baseOptions = getResponsiveOptions(window.innerWidth);

      // Add custom options for forecast chart
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        }
      };
    },
    paymentChartData() {
      try {
        // Use cached data if available
        const cacheKey = `payment-methods-${this.selectedTimePeriod}-${this.selectedCategory}`;
        if (this.chartDataCache.payment[cacheKey]) {
          return this.chartDataCache.payment[cacheKey];
        }

        // Adjust payment method percentages based on category if needed
        let paymentData = [...this.paymentMethods];

        if (this.selectedCategory !== 'all') {
          // Slightly adjust percentages based on category
          // This is just for demonstration - in a real app, this would use actual data
          switch(this.selectedCategory) {
            case 'Electronics':
              paymentData = [
                { method: 'Credit Card', percentage: 70, color: '#42b983' },
                { method: 'PayPal', percentage: 25, color: '#2196f3' },
                { method: 'Bank Transfer', percentage: 3, color: '#ff9800' },
                { method: 'Other', percentage: 2, color: '#9c27b0' }
              ];
              break;
            case 'Clothing':
              paymentData = [
                { method: 'Credit Card', percentage: 60, color: '#42b983' },
                { method: 'PayPal', percentage: 15, color: '#2196f3' },
                { method: 'Bank Transfer', percentage: 5, color: '#ff9800' },
                { method: 'Other', percentage: 20, color: '#9c27b0' }
              ];
              break;
            case 'Home Goods':
              paymentData = [
                { method: 'Credit Card', percentage: 55, color: '#42b983' },
                { method: 'PayPal', percentage: 15, color: '#2196f3' },
                { method: 'Bank Transfer', percentage: 25, color: '#ff9800' },
                { method: 'Other', percentage: 5, color: '#9c27b0' }
              ];
              break;
            case 'Accessories':
              paymentData = [
                { method: 'Credit Card', percentage: 75, color: '#42b983' },
                { method: 'PayPal', percentage: 20, color: '#2196f3' },
                { method: 'Bank Transfer', percentage: 2, color: '#ff9800' },
                { method: 'Other', percentage: 3, color: '#9c27b0' }
              ];
              break;
          }
        }

        // Also adjust slightly based on time period
        // Again, this is just for demonstration
        if (this.selectedTimePeriod === 'daily' || this.selectedTimePeriod === 'weekly') {
          // Slightly increase PayPal for shorter time periods
          paymentData = paymentData.map(p => {
            if (p.method === 'PayPal') {
              return { ...p, percentage: Math.min(p.percentage + 5, 30) };
            } else if (p.method === 'Credit Card') {
              return { ...p, percentage: Math.max(p.percentage - 5, 50) };
            }
            return p;
          });
        }

        // Create chart data for payment methods
        const chartData = {
          labels: paymentData.map(p => p.method),
          datasets: [
            {
              label: 'Payment Methods',
              data: paymentData.map(p => p.percentage),
              backgroundColor: paymentData.map(p => p.color),
              borderColor: paymentData.map(p => p.color),
              borderWidth: 1
            }
          ]
        };

        // Cache the data
        this.chartDataCache.payment[cacheKey] = chartData;
        return chartData;
      } catch (error) {
        console.error('Error creating payment chart data:', error);
        return { labels: [], datasets: [] };
      }
    },
    revenueChartData() {
      try {
        // Use cached data if available
        const cacheKey = `${this.selectedTimePeriod}-${this.selectedCategory}`;
        if (this.chartDataCache.revenue[cacheKey]) {
          return this.chartDataCache.revenue[cacheKey];
        }

        // Get the period data
        let period = this.revenueData[this.selectedTimePeriod];

        // Fallback to monthly if the selected period doesn't exist
        if (!period || !period.labels || !period.datasets) {
          console.warn(`Missing period data for ${this.selectedTimePeriod}, falling back to monthly`);
          period = this.revenueData.monthly;

          // If still no valid data, return empty chart
          if (!period || !period.labels || !period.datasets) {
            console.error('No valid chart data available');
            return { labels: [], datasets: [] };
          }
        }

        // Create a base safe copy of the chart data
        let baseChartData = safeChartDataCopy(period);

        // Apply category filter if needed
        if (this.selectedCategory !== 'all') {
          // Find the category ratio based on our product data
          const categoryProducts = this.topProducts.filter(p => p.category === this.selectedCategory);
          const totalRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0);
          const totalProducts = this.topProducts.reduce((sum, p) => sum + p.revenue, 0);

          // Default to 0.25 (25%) if we can't calculate a ratio
          const ratioToTotal = totalProducts > 0 ?
            (totalRevenue / totalProducts) : 0.25;

          // Ensure ratio is reasonable (between 0.1 and 0.9)
          const safeRatio = Math.max(0.1, Math.min(0.9, ratioToTotal));

          // Modify the datasets with category-specific information
          baseChartData.datasets = baseChartData.datasets.map(dataset => ({
            ...dataset,
            label: `${this.selectedCategory} ${dataset.label}`,
            data: dataset.data.map(val => Math.round(val * safeRatio))
          }));
        }

        // Simplify data for small screens if needed
        if (this.isSmallScreen) {
          baseChartData = simplifyChartDataForMobile(baseChartData);
        }

        // Cache the data
        this.chartDataCache.revenue[cacheKey] = baseChartData;
        return baseChartData;
      } catch (error) {
        console.error('Error creating revenue chart data:', error);
        return { labels: [], datasets: [] };
      }
    },
    categoryChartData() {
      try {
        // Use cached data if available
        const cacheKey = `${this.selectedTimePeriod}-${this.selectedCategory}`;
        if (this.chartDataCache.category[cacheKey]) {
          return this.chartDataCache.category[cacheKey];
        }

        let chartData;

        if (this.selectedCategory !== 'all') {
          // Get period labels based on selected time period
          let labels;
          switch(this.selectedTimePeriod) {
            case 'daily':
              labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              break;
            case 'weekly':
              labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
              break;
            case 'monthly':
              labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              break;
            case 'quarterly':
              labels = ['Q1', 'Q2', 'Q3', 'Q4'];
              break;
            case 'yearly':
              labels = ['2020', '2021', '2022', '2023'];
              break;
            default:
              labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
          }

          // Generate data based on time period
          const dataPoints = labels.length;
          const minValue = this.selectedTimePeriod === 'daily' ? 2000 :
                          this.selectedTimePeriod === 'weekly' ? 10000 : 20000;
          const maxValue = this.selectedTimePeriod === 'daily' ? 8000 :
                          this.selectedTimePeriod === 'weekly' ? 30000 : 60000;

          const categoryData = this.generateRandomData(dataPoints, minValue, maxValue);

          chartData = {
            labels: labels,
            datasets: [
              {
                label: `${this.selectedCategory} Revenue`,
                data: categoryData,
                backgroundColor: 'rgba(66, 185, 131, 0.2)',
                borderColor: '#42b983',
                borderWidth: 2
              }
            ]
          };
        } else {
          // Show all categories comparison using the safe copy utility
          if (!this.revenueData.categoryRevenue) {
            console.warn('Missing category revenue data, generating fallback data');

            // Create fallback category data
            const categories = this.categories;
            const categoryData = categories.map(cat => {
              // Generate a value between 50,000 and 500,000
              return Math.floor(Math.random() * 450000) + 50000;
            });

            chartData = {
              labels: categories,
              datasets: [
                {
                  label: 'Revenue by Category',
                  data: categoryData,
                  backgroundColor: [
                    'rgba(66, 185, 131, 0.6)',
                    'rgba(33, 150, 243, 0.6)',
                    'rgba(255, 152, 0, 0.6)',
                    'rgba(156, 39, 176, 0.6)'
                  ],
                  borderColor: [
                    '#42b983',
                    '#2196f3',
                    '#ff9800',
                    '#9c27b0'
                  ],
                  borderWidth: 1
                }
              ]
            };
          } else {
            chartData = safeChartDataCopy(this.revenueData.categoryRevenue);
          }
        }

        // Simplify data for small screens if needed
        if (this.isSmallScreen) {
          chartData = simplifyChartDataForMobile(chartData);
        }

        // Cache the data
        this.chartDataCache.category[cacheKey] = chartData;
        return chartData;
      } catch (error) {
        console.error('Error creating category chart data:', error);
        return { labels: [], datasets: [] };
      }
    },
    chartOptions() {
      // Get responsive options based on current screen width
      return getResponsiveOptions(window.innerWidth);
    }
  },
  methods: {
    async updateCharts() {
      // Show loading state
      this.isChartLoading = true;
      this.showCharts = false;
      this.chartError = false;

      // Force redraw of charts by incrementing the key
      this.chartKey += 1;

      // Clear cache when updating charts
      this.chartDataCache = {
        revenue: {},
        category: {},
        forecast: {},
        payment: {}
      };

      // Calculate metrics based on current selection
      this.calculateMetrics();

      try {
        // Wait for DOM update
        await nextTick();

        // Wait to ensure container sizes are calculated
        setTimeout(() => {
          // Make sure containers exist and have dimensions
          const revenueContainer = this.$refs.revenueChartContainer;
          const categoryContainer = this.$refs.categoryChartContainer;

          const hasValidContainers =
            revenueContainer &&
            categoryContainer &&
            revenueContainer.clientWidth > 0 &&
            categoryContainer.clientWidth > 0;

          if (!hasValidContainers) {
            this.loadAttempts++;
            if (this.loadAttempts < this.maxLoadAttempts) {
              console.warn(`Chart containers not ready, retrying (${this.loadAttempts}/${this.maxLoadAttempts})...`);
              setTimeout(() => this.updateCharts(), 300);
              return;
            } else {
              this.chartError = true;
              console.error('Failed to load charts after multiple attempts');
            }
          }

          // Reset counter on successful render
          this.loadAttempts = 0;

          // Finally show charts
          this.isChartLoading = false;
          this.showCharts = true;

          // Debug chart rendering if needed
          if (process.env.NODE_ENV === 'development') {
            this.debugCharts();
          }
        }, 500);
      } catch (error) {
        console.error('Error updating charts:', error);
        this.chartError = true;
        this.isChartLoading = false;
      }
    },
    applyFilters() {
      this.updateCharts();

      // Show notification
      if (this.notifications) {
        this.notifications.show(`Revenue data updated for ${this.selectedTimePeriod} period`, 'info');
      }
    },
    formatNumber(num) {
      return num.toLocaleString();
    },
    formatCurrency(value, currency = 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    },
    onDateRangeChange() {
      // Update time period to custom when date range is manually changed
      if (this.selectedTimePeriod !== 'custom') {
        this.selectedTimePeriod = 'custom';
      }
    },
    calculateMetrics() {
      try {
        // Get revenue data based on selected period
        let periodData = this.revenueData[this.selectedTimePeriod];

        // Fallback to monthly if the selected period doesn't exist
        if (!periodData || !periodData.datasets || !periodData.datasets[0]) {
          console.warn(`Missing period data for ${this.selectedTimePeriod}, falling back to monthly for metrics`);
          periodData = this.revenueData.monthly;

          // If still no valid data, use default values
          if (!periodData || !periodData.datasets || !periodData.datasets[0]) {
            console.error('No valid data for metrics calculation, using defaults');

            // Set default metrics
            this.metrics = {
              revenue: {
                current: 100000,
                previous: 90000,
                change: 11.11
              },
              orders: {
                current: 750,
                previous: 680,
                change: 10.29
              },
              aov: {
                current: 133.33,
                previous: 132.35,
                change: 0.74
              }
            };
            return;
          }
        }

        // Get revenue data from the first dataset
        const revenueData = periodData.datasets[0].data;
        const orderData = periodData.datasets[1]?.data || revenueData.map(val => Math.round(val / 130)); // Estimate if missing

        // Apply category filter if needed
        let categoryMultiplier = 1;
        if (this.selectedCategory !== 'all') {
          // Find the category ratio based on our product data
          const categoryProducts = this.topProducts.filter(p => p.category === this.selectedCategory);
          const totalRevenue = categoryProducts.reduce((sum, p) => sum + p.revenue, 0);
          const totalProducts = this.topProducts.reduce((sum, p) => sum + p.revenue, 0);

          // Default to 0.25 (25%) if we can't calculate a ratio
          categoryMultiplier = totalProducts > 0 ?
            (totalRevenue / totalProducts) : 0.25;

          // Ensure multiplier is reasonable (between 0.1 and 0.9)
          categoryMultiplier = Math.max(0.1, Math.min(0.9, categoryMultiplier));
        }

        // Calculate current period metrics with category filter applied
        const currentRevenue = revenueData.reduce((sum, val) => sum + val, 0) * categoryMultiplier;
        const currentOrders = orderData.reduce((sum, val) => sum + val, 0) * categoryMultiplier;
        const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;

        // Calculate previous period metrics based on comparison type
        let previousRevenue = 0;
        let previousOrders = 0;

        if (this.comparisonPeriod === 'previous') {
          // Use first half vs second half of the period for comparison
          const midpoint = Math.floor(revenueData.length / 2);
          previousRevenue = revenueData.slice(0, midpoint).reduce((sum, val) => sum + val, 0) * categoryMultiplier;
          previousOrders = orderData.slice(0, midpoint).reduce((sum, val) => sum + val, 0) * categoryMultiplier;
        } else if (this.comparisonPeriod === 'year') {
          // Simulate last year's data (70-90% of current)
          previousRevenue = currentRevenue * 0.8;
          previousOrders = currentOrders * 0.85;
        } else {
          // For 'none', still set some previous values for forecast calculation
          previousRevenue = currentRevenue * 0.9;
          previousOrders = currentOrders * 0.9;
        }

        const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

        // Calculate percentage changes
        const revenueChange = calculatePercentageChange(currentRevenue, previousRevenue);
        const ordersChange = calculatePercentageChange(currentOrders, previousOrders);
        const aovChange = calculatePercentageChange(currentAOV, previousAOV);

        // Update metrics
        this.metrics = {
          revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            change: revenueChange
          },
          orders: {
            current: currentOrders,
            previous: previousOrders,
            change: ordersChange
          },
          aov: {
            current: currentAOV,
            previous: previousAOV,
            change: aovChange
          }
        };

        // Update forecast data
        this.updateForecastData();
      } catch (error) {
        console.error('Error calculating metrics:', error);
      }
    },

    updateForecastData() {
      try {
        // Get the current revenue and calculate growth rate
        const currentRevenue = this.metrics.revenue.current;
        const previousRevenue = this.metrics.revenue.previous;
        const growthRate = (currentRevenue - previousRevenue) / previousRevenue;

        // Apply a conservative growth rate for forecast (between 2% and 15%)
        const forecastGrowthRate = Math.max(0.02, Math.min(0.15, growthRate));

        // Calculate forecast revenue
        const forecastRevenue = Math.round(currentRevenue * (1 + forecastGrowthRate));

        // Calculate forecast orders based on current AOV
        const forecastOrders = this.metrics.aov.current > 0 ?
          Math.round(forecastRevenue / this.metrics.aov.current) : 0;

        // Update forecast data
        this.forecastData = {
          revenue: forecastRevenue,
          orders: forecastOrders,
          change: forecastGrowthRate * 100,
          nextPeriod: this.getNextPeriodLabel()
        };
      } catch (error) {
        console.error('Error updating forecast data:', error);
      }
    },
    getTrendClass(change) {
      if (change > 0) return 'positive';
      if (change < 0) return 'negative';
      return 'neutral';
    },
    getTrendArrow(change) {
      if (change > 0) return '↑';
      if (change < 0) return '↓';
      return '→';
    },
    getComparisonLabel() {
      switch (this.comparisonPeriod) {
        case 'previous':
          return 'previous period';
        case 'year':
          return 'last year';
        default:
          return 'baseline';
      }
    },
    getNextPeriodLabel() {
      const labels = {
        daily: 'tomorrow',
        weekly: 'next week',
        monthly: 'next month',
        quarterly: 'next quarter',
        yearly: 'next year'
      };
      return labels[this.selectedTimePeriod] || 'next period';
    },
    generateForecastLabels(lastLabel, count) {
      // Generate labels for forecast periods based on the time period type
      const labels = [];

      if (this.selectedTimePeriod === 'monthly') {
        // For monthly data, generate next month names
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = months.indexOf(lastLabel);

        for (let i = 1; i <= count; i++) {
          const nextIndex = (monthIndex + i) % 12;
          labels.push(months[nextIndex]);
        }
      } else if (this.selectedTimePeriod === 'weekly') {
        // For weekly data, generate Week X+1, Week X+2, etc.
        const weekMatch = lastLabel.match(/Week (\d+)/);
        if (weekMatch && weekMatch[1]) {
          const weekNum = parseInt(weekMatch[1]);
          for (let i = 1; i <= count; i++) {
            labels.push(`Week ${weekNum + i}`);
          }
        } else {
          // Fallback
          for (let i = 1; i <= count; i++) {
            labels.push(`Forecast ${i}`);
          }
        }
      } else {
        // Generic forecast labels
        for (let i = 1; i <= count; i++) {
          labels.push(`Forecast ${i}`);
        }
      }

      return labels;
    },
    exportData() {
      try {
        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';

        // Add headers
        csvContent += 'Period,Revenue,Orders,Average Order Value\n';

        // Add current period data
        csvContent += `Current ${this.selectedTimePeriod},${this.metrics.revenue.current},${this.metrics.orders.current},${this.metrics.aov.current}\n`;

        // Add comparison period if applicable
        if (this.comparisonPeriod !== 'none') {
          csvContent += `${this.getComparisonLabel()},${this.metrics.revenue.previous},${this.metrics.orders.previous},${this.metrics.aov.previous}\n`;
        }

        // Add forecast data
        csvContent += `Forecast (${this.forecastData.nextPeriod}),${this.forecastData.revenue},${this.forecastData.orders},${this.forecastData.revenue / this.forecastData.orders}\n`;

        // Add category breakdown
        csvContent += '\nCategory Breakdown\n';
        csvContent += 'Category,Revenue,Orders\n';

        // Group products by category
        const categoryData = {};
        this.topProducts.forEach(product => {
          if (!categoryData[product.category]) {
            categoryData[product.category] = { revenue: 0, orders: 0 };
          }
          categoryData[product.category].revenue += product.revenue;
          categoryData[product.category].orders += product.sold;
        });

        // Add each category
        Object.entries(categoryData).forEach(([category, data]) => {
          csvContent += `${category},${data.revenue},${data.orders}\n`;
        });

        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `revenue_analysis_${this.selectedTimePeriod}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);

        // Show notification
        if (this.notifications) {
          this.notifications.show('Revenue data exported successfully', 'success');
        }
      } catch (error) {
        console.error('Error exporting data:', error);
        if (this.notifications) {
          this.notifications.show('Failed to export data', 'error');
        }
      }
    },
    generateRandomData(count, min, max) {
      try {
        // Use a seed based on category and time period to keep data consistent
        const seed = this.selectedCategory + this.selectedTimePeriod;
        let value = 0;

        return Array.from({ length: count }, (_, i) => {
          // Use a simple pseudo-random algorithm that will give the same results for the same seed+i
          value = (seed.charCodeAt(0) * 9301 + (i * 49297)) % 233280;
          return min + Math.floor(value / 233280 * (max - min));
        });
      } catch (error) {
        console.error('Error generating random data:', error);
        return Array(count).fill(0);
      }
    },
    debugCharts() {
      // Add unique IDs to chart containers for debugging
      if (!this.$refs.revenueChartContainer.id) {
        this.$refs.revenueChartContainer.id = 'revenue-chart-container';
      }
      if (!this.$refs.categoryChartContainer.id) {
        this.$refs.categoryChartContainer.id = 'category-chart-container';
      }
      if (!this.$refs.forecastChartContainer.id) {
        this.$refs.forecastChartContainer.id = 'forecast-chart-container';
      }
      if (!this.$refs.paymentChartContainer.id) {
        this.$refs.paymentChartContainer.id = 'payment-chart-container';
      }

      // Log chart info after a brief delay to allow rendering
      setTimeout(() => {
        logChartInfo('revenue-chart-container');
        logChartInfo('category-chart-container');
        logChartInfo('forecast-chart-container');
        logChartInfo('payment-chart-container');

        // Check if container dimensions are too small
        const revenueContainer = this.$refs.revenueChartContainer;
        const categoryContainer = this.$refs.categoryChartContainer;
        const forecastContainer = this.$refs.forecastChartContainer;
        const paymentContainer = this.$refs.paymentChartContainer;

        if (revenueContainer.clientWidth < 100 || revenueContainer.clientHeight < 100) {
          console.warn('Revenue chart container dimensions are too small for proper rendering');
        }

        if (categoryContainer.clientWidth < 100 || categoryContainer.clientHeight < 100) {
          console.warn('Category chart container dimensions are too small for proper rendering');
        }

        if (forecastContainer.clientWidth < 100 || forecastContainer.clientHeight < 100) {
          console.warn('Forecast chart container dimensions are too small for proper rendering');
        }

        if (paymentContainer.clientWidth < 100 || paymentContainer.clientHeight < 100) {
          console.warn('Payment chart container dimensions are too small for proper rendering');
        }
      }, 1000);
    },
    checkDataValidity() {
      // Validate revenue data
      const hasValidRevenueData =
        this.revenueData &&
        this.revenueData[this.selectedTimePeriod] &&
        this.revenueData[this.selectedTimePeriod].datasets &&
        this.revenueData[this.selectedTimePeriod].datasets.length > 0;

      if (!hasValidRevenueData) {
        console.error('Invalid revenue data structure');
        return false;
      }

      // Validate category data if showing all categories
      if (this.selectedCategory === 'all') {
        const hasValidCategoryData =
          this.revenueData.categoryRevenue &&
          this.revenueData.categoryRevenue.datasets &&
          this.revenueData.categoryRevenue.datasets.length > 0;

        if (!hasValidCategoryData) {
          console.error('Invalid category data structure');
          return false;
        }
      }

      // For forecast and payment charts, we generate the data dynamically
      // so we don't need to validate them here

      return true;
    },
    handleOrientationChange() {
      // Redraw charts after orientation change with slight delay
      setTimeout(() => {
        this.chartKey += 1;
        if (process.env.NODE_ENV === 'development') {
          this.debugCharts();
        }
      }, 300);
    },
    handleResize: function() {
      // Only redraw on significant size changes
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        // Check if we're crossing a breakpoint
        const wasSmallScreen = this.isSmallScreen;
        const wasMediumScreen = this.isMediumScreen;

        // Update screen size flags
        this.isSmallScreen = window.innerWidth < 768;
        this.isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Check if we crossed a breakpoint
        const breakpointChanged =
          wasSmallScreen !== this.isSmallScreen ||
          wasMediumScreen !== this.isMediumScreen;

        // Force chart redraw when crossing breakpoints
        if (breakpointChanged) {
          this.chartKey += 1;

          // Debug in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`Screen size changed: ${window.innerWidth}x${window.innerHeight}`);
          }
        }
      }, 250);
    }
  },
  mounted() {
    // Enable debug outlines in development mode
    let removeDebugOutlines = null;
    if (process.env.NODE_ENV === 'development') {
      removeDebugOutlines = addDebugOutlines();
    }

    // Initialize screen size flags
    this.isSmallScreen = window.innerWidth < 768;
    this.isMediumScreen = window.innerWidth >= 768 && window.innerWidth < 1024;

    // Initialize metrics
    this.calculateMetrics();

    // Wait to ensure component is mounted and DOM is ready
    setTimeout(() => {
      // Validate data before attempting to render
      if (this.checkDataValidity()) {
        this.updateCharts();
      } else {
        this.chartError = true;
        this.isChartLoading = false;
      }

      // Add event listeners for responsiveness
      window.addEventListener('orientationchange', this.handleOrientationChange);
      window.addEventListener('resize', this.handleResize);

      if (process.env.NODE_ENV === 'development') {
        console.log(`Initial screen size: ${window.innerWidth}x${window.innerHeight}`);
      }
    }, 300);

    // Store the cleanup function to be called in beforeUnmount
    this.cleanupDebugOutlines = removeDebugOutlines;
  },
  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('orientationchange', this.handleOrientationChange);
    window.removeEventListener('resize', this.handleResize);

    // Clean up debug outlines if they exist
    if (this.cleanupDebugOutlines) {
      this.cleanupDebugOutlines();
    }
  }
}
</script>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
  flex: 1;
}

.filter-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-muted);
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background-color: white;
  color: var(--text-main);
  font-size: 0.95rem;
  transition: var(--transition-normal);
  width: 100%;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px rgba(127, 86, 217, 0.15);
}

.date-range {
  min-width: 300px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-inputs input {
  flex: 1;
}

.date-separator {
  color: var(--text-muted);
  font-weight: 500;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.apply-button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
}

.apply-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
}

.export-button {
  background: var(--secondary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 5px;
}

.export-button:hover {
  background: var(--secondary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(11, 165, 236, 0.3);
}

.icon {
  font-size: 16px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.metric-card h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.amount {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
  color: var(--text-main);
}

.trend {
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.trend-arrow {
  margin-right: 5px;
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

.trend.forecast {
  color: var(--warning);
}

.chart-section {
  margin-bottom: 30px;
  width: 100%;
}

.chart-section h3 {
  margin-bottom: 16px;
  font-size: 1.25rem;
  font-weight: 600;
}

.chart-container {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  height: 350px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
  width: 100%;
}

.chart-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}

.chart-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #e53e3e;
  background-color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 1rem;
  z-index: 5;
}

.chart-container:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.loading-chart {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-muted);
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 5;
}

.top-products {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(226, 232, 240, 0.6);
  margin-bottom: 40px;
  transition: var(--transition-normal);
  overflow-x: auto;
  width: 100%;
}

.top-products:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.top-products h3 {
  margin-bottom: 16px;
  font-size: 1.25rem;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 600px;
}

th {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.85rem;
}

td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 0.95rem;
}

/* Tablet and smaller desktops */
@media (max-width: 1024px) {
  .metrics-row {
    gap: 16px;
  }

  .chart-container {
    padding: 20px;
  }

  .top-products {
    padding: 20px;
  }

  .amount {
    font-size: 26px;
  }
}

/* Tablets and large phones */
@media (max-width: 768px) {
  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .filter-row {
    flex-direction: column;
    gap: 16px;
  }

  .filter-group {
    width: 100%;
    min-width: unset;
  }

  .date-range {
    min-width: unset;
  }

  .filter-actions {
    width: 100%;
    margin-top: 8px;
    display: flex;
    gap: 10px;
  }

  .apply-button, .export-button {
    flex: 1;
  }

  .chart-container {
    height: 300px;
    padding: 16px;
  }

  th, td {
    padding: 12px 8px;
    font-size: 0.85rem;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-card h3 {
    font-size: 1rem;
  }

  .amount {
    font-size: 24px;
    margin: 8px 0;
  }

  .trend {
    font-size: 13px;
  }

  .chart-section h3,
  .top-products h3 {
    font-size: 1.15rem;
    margin-bottom: 12px;
  }
}

/* Surface Duo specific */
@media (width: 540px) and (height: 720px),
       (width: 720px) and (height: 540px) {
  .chart-container {
    height: 280px;
  }

  .metrics-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Small tablets and large phones */
@media (max-width: 576px) {
  .metrics-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
    flex: 1 1 100%;
  }

  .filter-actions {
    flex-direction: column;
  }

  .apply-button, .export-button {
    width: 100%;
  }

  .chart-container {
    height: 250px;
    padding: 12px;
  }

  th, td {
    padding: 8px 6px;
    font-size: 0.8rem;
  }

  .amount {
    font-size: 22px;
  }

  .trend {
    font-size: 12px;
  }

  .chart-section h3,
  .top-products h3 {
    font-size: 1.1rem;
  }

  .top-products {
    padding: 16px 12px;
  }
}

/* Mobile phones */
@media (max-width: 480px) {
  .filters {
    margin-bottom: 20px;
    gap: 12px;
  }

  .filter-group label {
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  .filter-group select,
  .apply-button {
    font-size: 0.9rem;
    padding: 8px 10px;
  }

  .metric-card {
    padding: 16px 12px;
  }

  .metric-card h3 {
    font-size: 0.95rem;
  }

  .amount {
    font-size: 20px;
    margin: 6px 0;
  }

  .trend {
    font-size: 11px;
  }

  .chart-section h3,
  .top-products h3 {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  /* Mobile-optimized table */
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
    margin-bottom: 8px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.5);
  }

  td {
    display: flex;
    padding: 6px 0;
    border-bottom: none;
    font-size: 0.85rem;
    position: relative;
  }

  /* Add labels for data */
  td:before {
    content: attr(data-label);
    font-weight: 600;
    width: 40%;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .chart-container {
    height: 220px;
    padding: 12px 8px;
    margin-bottom: 20px;
  }

  .chart-wrapper {
    overflow: hidden;
  }

  /* Fix chart display on small screens */
  canvas {
    max-height: 100% !important;
    max-width: 100% !important;
  }
}

/* Extra small devices */
@media (max-width: 360px) {
  .chart-container {
    height: 200px;
    padding: 10px 6px;
  }

  .metric-card {
    padding: 12px 10px;
  }

  .amount {
    font-size: 18px;
  }

  .trend {
    font-size: 10px;
  }

  td:before {
    width: 45%;
  }
}
</style>