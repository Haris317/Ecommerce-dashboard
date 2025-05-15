<template>
  <div class="chart-wrapper" ref="container">
    <canvas ref="canvas"></canvas>
    <div v-if="chartError" class="chart-error">
      Failed to load chart. Please refresh.
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import {
  getResponsiveOptions,
  simplifyChartDataForMobile,
  safeChartDataCopy
} from '../utils/chartConfig'

Chart.register(...registerables)

export default {
  name: 'LineChart',
  props: {
    chartData: { type: Object, required: true },
    options: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      chart: null,
      chartError: false,
      isSmallScreen: false,
      resizeTimeout: null
    }
  },
  watch: {
    chartData: { deep: true, handler: 'renderChart' },
    options: { deep: true, handler: 'renderChart' }
  },
  mounted() {
    this.updateScreenSize()
    window.addEventListener('resize', this.debouncedResize)
    window.addEventListener('orientationchange', this.delayedReinit)

    this.$nextTick(() => {
      this.renderChart()
    })
  },
  beforeUnmount() {
    this.cleanupChart()
    window.removeEventListener('resize', this.debouncedResize)
    window.removeEventListener('orientationchange', this.delayedReinit)
    clearTimeout(this.resizeTimeout)
  },
  methods: {
    updateScreenSize() {
      const { innerWidth: w, innerHeight: h } = window
      const duoMatch = (w === 540 && (h === 720 || h === 740)) || (h === 540 && (w === 720 || w === 740))
      this.isSmallScreen = w < 768 || duoMatch
    },
    debouncedResize() {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => {
        const wasSmall = this.isSmallScreen
        this.updateScreenSize()
        if (this.isSmallScreen !== wasSmall) {
          this.renderChart()
        } else if (this.chart) {
          this.chart.resize()
        }
      }, 250)
    },
    delayedReinit() {
      setTimeout(() => {
        this.renderChart()
      }, 300)
    },
    cleanupChart() {
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
    },
    renderChart() {
      const canvas = this.$refs.canvas
      const container = this.$refs.container

      if (!canvas || !container) return

      this.cleanupChart()
      this.chartError = false

      if (!this.chartData?.datasets?.length) {
        this.chartError = true
        return
      }

      // Wait for dimensions to be ready
      if (!container.clientWidth) {
        setTimeout(this.renderChart, 100)
        return
      }

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight || 300

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        this.chartError = true
        return
      }

      const chartSafeData = this.isSmallScreen
        ? simplifyChartDataForMobile(this.chartData)
        : safeChartDataCopy(this.chartData)

      const finalOptions = {
        ...getResponsiveOptions(window.innerWidth),
        ...this.options
      }

      try {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: chartSafeData,
          options: finalOptions
        })
      } catch (err) {
        console.error('Chart creation failed:', err)
        this.chartError = true
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 300px;
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.chart-error {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  color: #e53e3e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  padding: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .chart-wrapper {
    min-height: 250px;
  }
}

@media (width: 540px) and (height: 740px),
       (width: 740px) and (height: 540px),
       (width: 540px) and (height: 720px),
       (width: 720px) and (height: 540px) {
  .chart-wrapper {
    min-height: 230px;
  }
}

@media (max-width: 480px) {
  .chart-wrapper {
    min-height: 200px;
  }
}
</style>
