<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/entities/theme'

const theme = useThemeStore()

onMounted(() => {
  void theme.load()
})
</script>

<template>
  <RouterView />
</template>
