<template>
  <admin-layout>
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12">
        <stocks-metrics />
      </div>

      <div class="col-span-12 space-y-6 xl:col-span-8">
        <portfolio-performance-chart />
        <trending-stocks />
      </div>

      <div class="col-span-12 space-y-6 xl:col-span-4">
        <dividend-chart />
        <my-watch-list v-if="items.length" :items="items" />
      </div>

      <div class="col-span-12">
        <stocks-table />
      </div>
    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import StocksMetrics from '../components/stocks/StocksMetrics.vue'
import PortfolioPerformanceChart from '../components/stocks/PortfolioPerformanceChart.vue'
import DividendChart from '../components/stocks/DividendChart.vue'
import MyWatchlistCompras from '../components/stocks/Watchlist/MyWatchlistCompras.vue'
import TrendingStocks from '../components/stocks/TrendingStocks.vue'
import StocksTable from '../components/stocks/StocksTable.vue'


const items = ref([{ symbol: 'AAPL', name: 'Apple, Inc', logo: '/images/brand/brand-07.svg', price: '$4,008.65', change: 11.01, }, { symbol: 'SPOT', name: 'Spotify.com', logo: '/images/brand/brand-11.svg', price: '$11,689.00', change: 9.48, }, { symbol: 'ABNB', name: 'Airbnb, Inc', logo: '/images/brand/brand-12.svg', price: '$32,227.00', change: -0.29, }, { symbol: 'ENVT', name: 'Envato, Inc', logo: '/images/brand/brand-13.svg', price: '$13,895.00', change: 3.79, }, { symbol: 'AAPL', name: 'Apple, Inc', logo: '/images/brand/brand-07.svg', price: '$4,008.65', change: 11.01, }, { symbol: 'SPOT', name: 'Spotify.com', logo: '/images/brand/brand-11.svg', price: '$11,689.00', change: 9.48, }, { symbol: 'QIWI', name: 'qiwi.com, Inc', logo: '/images/brand/brand-14.svg', price: '$4,008.65', change: 4.52, },])
</script>
