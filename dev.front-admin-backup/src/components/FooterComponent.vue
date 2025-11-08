<template>
  <footer class="btm-nav h-16 bg-orangeCustom4">
    <router-link to="/ventasws">
      <button>
        <IconWrapper :icon="WhatsAppIcon" :size="sizeIconWhatsApp" />
      </button>
    </router-link>
    <router-link to="/search">
      <button class="disabled" tabindex="-1" aria-disabled="true">
        <IconWrapper :icon="SearchIcon" :size="sizeIcon" />
      </button>
    </router-link>
    <!-- <router-link to="/home">
      <button>
        <IconWrapper :icon="ListIcon" :size="sizeIcon" />
      </button>
    </router-link> -->
  </footer>
</template>
<script setup lang="ts">
import HomeIcon from './icons/HomeIcon.vue';
import ListIcon from './icons/ListIcon.vue';
import SearchIcon from './icons/SearchIcon.vue';
import WhatsAppIcon from './icons/WhatsAppIcon.vue';

import IconWrapper from './IconWrapper.vue';

const sizeIcon: string = '30';
const sizeIconWhatsApp: string = '40';
</script>
