import { 
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
export function registerChartComponents() {
  Chart.register(
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LineController,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend,
    Filler
  );
}

// Default chart options
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        boxWidth: 12,
        padding: 10,
        usePointStyle: true
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 10,
      cornerRadius: 4,
      intersect: false,
      mode: 'index'
    }
  },
  elements: {
    line: {
      tension: 0.3,
      borderWidth: 2
    },
    point: {
      radius: 3,
      hitRadius: 10,
      hoverRadius: 5
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  animation: {
    duration: 750
  }
};

// Mobile-specific chart options
export const getMobileOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  devicePixelRatio: window.devicePixelRatio || 2, // Better rendering on high-DPI mobile screens
  plugins: {
    legend: {
      position: 'top',
      align: 'start',
      labels: {
        boxWidth: 8,
        padding: 4,
        font: {
          size: 9
        },
        usePointStyle: true
      }
    },
    tooltip: {
      enabled: true,
      titleFont: {
        size: 10
      },
      bodyFont: {
        size: 9
      },
      padding: 5,
      displayColors: false, // Simplify tooltip for mobile
      intersect: false,
      mode: 'nearest'
    }
  },
  animation: {
    duration: 300 // Faster animations on mobile
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: 9
        },
        padding: 3,
        maxTicksLimit: 5 // Fewer ticks on mobile
      },
      grid: {
        drawBorder: false,
        color: 'rgba(0, 0, 0, 0.07)'
      }
    },
    x: {
      ticks: {
        font: {
          size: 9
        },
        padding: 3,
        maxRotation: 45,
        minRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6
      },
      grid: {
        display: false
      }
    }
  },
  elements: {
    point: {
      radius: 2, // Smaller points on mobile 
      hoverRadius: 5
    },
    line: {
      borderWidth: 2,
      tension: 0.4
    }
  }
});

// Get responsive options based on screen width
export function getResponsiveOptions(width) {
  const height = window.innerHeight;
  
  if (width < 480) { // Extra small devices
    const mobileOptions = getMobileOptions();
    return {
      ...mobileOptions,
      plugins: {
        ...mobileOptions.plugins,
        legend: {
          ...mobileOptions.plugins.legend,
          display: false // Hide legend on very small screens
        }
      }
    };
  } else if ((width === 540 && height === 720) || (width === 720 && height === 540)) { // Surface Duo
    const mobileOptions = getMobileOptions();
    return {
      ...mobileOptions,
      scales: {
        ...mobileOptions.scales,
        x: {
          ...mobileOptions.scales.x,
          ticks: {
            ...mobileOptions.scales.x.ticks,
            maxTicksLimit: 7,  // Optimized for Surface Duo
            font: {
              size: 10
            }
          }
        },
        y: {
          ...mobileOptions.scales.y,
          ticks: {
            ...mobileOptions.scales.y.ticks,
            maxTicksLimit: 5,  // Optimized for Surface Duo
            font: {
              size: 10
            }
          }
        }
      },
      elements: {
        ...mobileOptions.elements,
        point: {
          ...mobileOptions.elements.point,
          radius: 2.5
        }
      }
    };
  } else if (width === 540 || width === 740) { // Specific handling for 540*740 resolution
    const mobileOptions = getMobileOptions();
    return {
      ...mobileOptions,
      scales: {
        ...mobileOptions.scales,
        x: {
          ...mobileOptions.scales.x,
          ticks: {
            ...mobileOptions.scales.x.ticks,
            maxTicksLimit: 8,  // Allow more labels for this resolution
            font: {
              size: 10
            }
          }
        },
        y: {
          ...mobileOptions.scales.y,
          ticks: {
            ...mobileOptions.scales.y.ticks,
            maxTicksLimit: 6,  // Show more y-axis ticks
            font: {
              size: 10
            }
          }
        }
      },
      elements: {
        ...mobileOptions.elements,
        point: {
          ...mobileOptions.elements.point,
          radius: 2.5  // Slightly larger points for this resolution
        }
      }
    };
  } else if (width < 768) { // Mobile devices
    return getMobileOptions();
  }
  return defaultOptions; // Tablet and larger devices
}

// Helper function to safely clone chart data
export function safeChartDataCopy(chartData) {
  if (!chartData || !chartData.labels || !chartData.datasets) {
    console.warn('Invalid chart data structure', chartData);
    return { labels: [], datasets: [] };
  }

  try {
    return {
      labels: Array.isArray(chartData.labels) ? [...chartData.labels] : [],
      datasets: Array.isArray(chartData.datasets) 
        ? chartData.datasets.map(dataset => ({
            label: dataset.label || '',
            data: Array.isArray(dataset.data) ? [...dataset.data] : [],
            backgroundColor: dataset.backgroundColor || 'rgba(66, 153, 225, 0.2)',
            borderColor: dataset.borderColor || 'rgb(66, 153, 225)',
            borderWidth: dataset.borderWidth || 2,
            fill: dataset.fill !== undefined ? dataset.fill : false,
            tension: dataset.tension !== undefined ? dataset.tension : 0.3,
            pointRadius: dataset.pointRadius || 3,
            pointHoverRadius: dataset.pointHoverRadius || 5
          }))
        : []
    };
  } catch (error) {
    console.error('Error creating safe chart data copy:', error);
    return { labels: [], datasets: [] };
  }
}

// Simplify data for small screens if needed
export function simplifyChartDataForMobile(chartData) {
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return { labels: [], datasets: [] };
  }
  
  // Create a copy of the data
  const simplifiedData = safeChartDataCopy(chartData);
  
  // Determine the screen width and height
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Check if this is a Surface Duo device
  const isSurfaceDuo = (screenWidth === 540 && screenHeight === 720) || 
                      (screenWidth === 720 && screenHeight === 540);
  
  // If we have too many labels, only show a subset
  // Special handling for different resolutions
  const maxLabels = screenWidth < 480 ? 6 : 
                  isSurfaceDuo ? 7 :
                  (screenWidth === 540 || screenWidth === 740) ? 8 : 10;
  
  if (simplifiedData.labels.length > maxLabels) {
    const originalLabels = [...simplifiedData.labels];
    const simplifiedLabels = [];
    
    // Calculate step size based on the number of labels
    const step = Math.ceil(originalLabels.length / maxLabels);
    
    // Keep only every Nth label, others become empty strings
    originalLabels.forEach((label, index) => {
      simplifiedLabels.push(index % step === 0 ? label : '');
    });
    
    simplifiedData.labels = simplifiedLabels;
  }
  
  // Limit the number of datasets for better mobile rendering
  // But allow more datasets for specific resolutions
  if (simplifiedData.datasets.length > 3 && screenWidth < 480) {
    simplifiedData.datasets = simplifiedData.datasets.slice(0, 3);
  } else if (simplifiedData.datasets.length > 4 && isSurfaceDuo) {
    simplifiedData.datasets = simplifiedData.datasets.slice(0, 4);
  } else if (simplifiedData.datasets.length > 4 && 
            (screenWidth === 540 || screenWidth === 740)) {
    simplifiedData.datasets = simplifiedData.datasets.slice(0, 4);
  }
  
  // Adjust datasets for mobile
  simplifiedData.datasets.forEach(dataset => {
    dataset.borderWidth = (dataset.borderWidth || 2) + 1;
    // Specific point radius based on device
    dataset.pointRadius = screenWidth < 480 ? 2 : 
                        isSurfaceDuo ? 2.5 :
                        (screenWidth === 540 || screenWidth === 740) ? 2.5 : 3;
    dataset.tension = 0.4; // Add some curve to make lines more readable
  });
  
  return simplifiedData;
} 