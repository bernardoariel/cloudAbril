<template>
  <footer class="btm-nav h-16 bg-primary">
    <router-link v-if="isAdmin" to="/ventasws">
      <button>
        <IconWrapper :icon="WhatsAppIcon" :size="sizeIconWhatsApp" />
      </button>
    </router-link>
    <router-link to="/search">
      <button>
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
import { computed } from 'vue';
import HomeIcon from './icons/HomeIcon.vue';
import ListIcon from './icons/ListIcon.vue';
import SearchIcon from './icons/SearchIcon.vue';
import WhatsAppIcon from './icons/WhatsAppIcon.vue';
import IconWrapper from './IconWrapper.vue';
import { useAuthStore } from '@/store/useAuth';
import { storeToRefs } from 'pinia';

const sizeIcon: string = '30';
const sizeIconWhatsApp: string = '40';

// Obtener el store de autenticación
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Computed para verificar si el usuario es administrador
const isAdmin = computed(() => {
  if (!user.value) return false;
  
  const adminEmails = [
    'mario@abrilamoblamientos.com.ar',
    'arielbernardo@hotmail.com'
  ];
  
  return adminEmails.includes(user.value);
});
</script>
