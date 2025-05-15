
export function logChartInfo(containerId, chartInstance = null) {

  setTimeout(() => {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Chart container #${containerId} not found`);
        return;
      }
      
      console.group(`Chart Debug Info: #${containerId}`);
      console.log('Container dimensions:', {
        width: container.clientWidth,
        height: container.clientHeight,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        scrollWidth: container.scrollWidth,
        scrollHeight: container.scrollHeight
      });
      
      const canvas = container.querySelector('canvas');
      if (canvas) {
        console.log('Canvas dimensions:', {
          width: canvas.width,
          height: canvas.height,
          style: {
            width: canvas.style.width,
            height: canvas.style.height
          }
        });
      } else {
        console.warn('No canvas found in container');
      }
      
      if (chartInstance) {
        console.log('Chart instance:', {
          width: chartInstance.width,
          height: chartInstance.height,
          aspectRatio: chartInstance.aspectRatio,
          options: chartInstance.options
        });
      }
      
      console.log('Window dimensions:', {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      });
      
      console.groupEnd();
    } catch (error) {
      console.error('Error logging chart info:', error);
    }
  }, 100);
}

export function addDebugOutlines() {
  const style = document.createElement('style');
  style.id = 'chart-debug-styles';
  style.textContent = `
    .chart-container { 
      border: 2px solid red !important; 
    }
    .chart-wrapper { 
      border: 2px solid blue !important; 
    }
    canvas { 
      border: 2px solid green !important; 
    }
  `;
  document.head.appendChild(style);
  console.log('Debug outlines added to chart elements');
  
  return () => {
  
    const debugStyle = document.getElementById('chart-debug-styles');
    if (debugStyle) {
      debugStyle.remove();
      console.log('Debug outlines removed');
    }
  };
}


export function simulateMobileScreen(width = 375, height = 667) {
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;
  

  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });
  

  window.dispatchEvent(new Event('resize'));
  
  console.log(`Simulated mobile screen: ${width}x${height}px`);
  

  return () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalHeight
    });
    
    window.dispatchEvent(new Event('resize'));
    console.log('Restored original screen dimensions');
  };
} 