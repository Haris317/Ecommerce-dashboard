/**
 * Revenue Analysis Utilities
 * Provides functions for date handling, forecasting, and data processing
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date object or date string
 * @param {string} format - Format type ('short', 'medium', 'long')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'medium') {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options = {
    short: { month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
}

/**
 * Get date range for a period
 * @param {string} period - Period type ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
 * @param {Date} [endDate=new Date()] - End date (defaults to today)
 * @returns {Object} Object with start and end dates
 */
export function getDateRange(period, endDate = new Date()) {
  const end = new Date(endDate);
  const start = new Date(end);
  
  switch (period) {
    case 'daily':
      start.setDate(end.getDate() - 7); // Last 7 days
      break;
    case 'weekly':
      start.setDate(end.getDate() - 28); // Last 4 weeks
      break;
    case 'monthly':
      start.setMonth(end.getMonth() - 12); // Last 12 months
      break;
    case 'quarterly':
      start.setMonth(end.getMonth() - 15); // Last 5 quarters
      break;
    case 'yearly':
      start.setFullYear(end.getFullYear() - 3); // Last 3 years
      break;
    default:
      start.setDate(end.getDate() - 30); // Default to 30 days
  }
  
  return { start, end };
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Format a number as currency
 * @param {number} value - Number to format
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Generate forecast data based on historical data
 * Uses simple moving average with trend adjustment
 * 
 * @param {Array} historicalData - Array of historical data points
 * @param {number} periods - Number of periods to forecast
 * @returns {Array} Forecasted data points
 */
export function generateForecast(historicalData, periods = 3) {
  if (!historicalData || historicalData.length < 2) {
    return Array(periods).fill(0);
  }
  
  // Calculate average change over the last few periods
  const recentData = historicalData.slice(-6); // Use last 6 periods
  let avgChange = 0;
  
  for (let i = 1; i < recentData.length; i++) {
    avgChange += (recentData[i] - recentData[i-1]);
  }
  
  avgChange = avgChange / (recentData.length - 1);
  
  // Last known value
  const lastValue = historicalData[historicalData.length - 1];
  
  // Generate forecast with trend adjustment
  return Array.from({ length: periods }, (_, i) => {
    return Math.max(0, Math.round(lastValue + (avgChange * (i + 1))));
  });
}

/**
 * Group orders by a specific time period
 * @param {Array} orders - Array of order objects
 * @param {string} period - Period to group by ('day', 'week', 'month')
 * @returns {Object} Grouped orders with revenue totals
 */
export function groupOrdersByPeriod(orders, period = 'day') {
  const grouped = {};
  
  orders.forEach(order => {
    const date = new Date(order.date);
    let key;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        // Get the week number
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${weekNum}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        orders: [],
        revenue: 0,
        count: 0
      };
    }
    
    grouped[key].orders.push(order);
    grouped[key].revenue += order.amount;
    grouped[key].count += 1;
  });
  
  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Generate comparison data between two periods
 * @param {Object} currentPeriod - Current period data
 * @param {Object} previousPeriod - Previous period data
 * @returns {Object} Comparison metrics
 */
export function generatePeriodComparison(currentPeriod, previousPeriod) {
  const currentRevenue = currentPeriod.reduce((sum, item) => sum + item.revenue, 0);
  const previousRevenue = previousPeriod.reduce((sum, item) => sum + item.revenue, 0);
  
  const currentOrders = currentPeriod.reduce((sum, item) => sum + item.count, 0);
  const previousOrders = previousPeriod.reduce((sum, item) => sum + item.count, 0);
  
  const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;
  const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;
  
  return {
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      change: calculatePercentageChange(currentRevenue, previousRevenue)
    },
    orders: {
      current: currentOrders,
      previous: previousOrders,
      change: calculatePercentageChange(currentOrders, previousOrders)
    },
    aov: {
      current: currentAOV,
      previous: previousAOV,
      change: calculatePercentageChange(currentAOV, previousAOV)
    }
  };
}
