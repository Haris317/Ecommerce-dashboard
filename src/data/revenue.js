export const revenueData = {
  daily: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: [3100, 4200, 2800, 5100, 4300, 6500, 7200],
        backgroundColor: 'rgba(66, 185, 131, 0.2)',
        borderColor: '#42b983',
        borderWidth: 2
      },
      {
        label: 'Orders',
        data: [25, 32, 21, 35, 28, 45, 55],
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196f3',
        borderWidth: 2
      }
    ]
  },
  weekly: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: [18500, 24300, 28400, 32100],
        backgroundColor: 'rgba(66, 185, 131, 0.2)',
        borderColor: '#42b983',
        borderWidth: 2
      },
      {
        label: 'Orders',
        data: [145, 180, 195, 230],
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196f3',
        borderWidth: 2
      }
    ]
  },
  monthly: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [65000, 59000, 80000, 81000, 85000, 88000, 95000, 102000, 110000, 112000, 118000, 135000],
        backgroundColor: 'rgba(66, 185, 131, 0.2)',
        borderColor: '#42b983',
        borderWidth: 2
      },
      {
        label: 'Orders',
        data: [450, 410, 500, 550, 580, 620, 670, 720, 790, 820, 870, 950],
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196f3',
        borderWidth: 2
      }
    ]
  },
  categoryRevenue: {
    labels: ['Electronics', 'Clothing', 'Home Goods', 'Accessories', 'Others'],
    datasets: [
      {
        label: 'Revenue by Category',
        data: [580000, 320000, 250000, 190000, 120000],
        backgroundColor: [
          'rgba(66, 185, 131, 0.6)',
          'rgba(33, 150, 243, 0.6)',
          'rgba(255, 152, 0, 0.6)',
          'rgba(156, 39, 176, 0.6)',
          'rgba(244, 67, 54, 0.6)'
        ],
        borderColor: [
          '#42b983',
          '#2196f3',
          '#ff9800',
          '#9c27b0',
          '#f44336'
        ],
        borderWidth: 1
      }
    ]
  }
}; 