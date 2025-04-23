<template>
  <div
      class="creator-card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-6 text-center"
  >
    <!-- Аватар -->
    <img
        :src="creator.avatar"
        alt="avatar"
        class="w-24 h-24 rounded-full mx-auto border-4 border-indigo-500 mb-4"
    />

    <!-- Ім’я та жанр -->
    <h3 class="text-xl font-semibold text-gray-800">{{ creator.username }}</h3>
    <p class="text-sm text-gray-500 mb-2">{{ creator.genre }}</p>

    <!-- Соцмережі -->
    <div class="flex justify-center gap-4 mt-3 text-indigo-600">
      <i
          v-for="icon in creator.socials"
          :key="icon"
          :class="getIconClass(icon)"
          class="text-2xl hover:text-indigo-800 transition-transform hover:scale-110"
      />
    </div>

    <!-- Кнопка -->
    <router-link
        :to="`/author/${creator.username}`"
        class="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm font-semibold transition-all duration-300"
    >
      Перейти на сторінку
    </router-link>
  </div>
</template>

<script>
export default {
  props: ['creator'],
  methods: {
    getIconClass(icon) {
      const icons = {
        youtube: 'fab fa-youtube',
        telegram: 'fab fa-telegram',
        instagram: 'fab fa-instagram',
        tiktok: 'fab fa-tiktok'
      }
      return icons[icon] || 'fas fa-link'
    }
  }
}
</script>

<style scoped>
.creator-card {
  background: linear-gradient(145deg, #f4f4ff, #eef8ff);
  border: 1px solid #e5e7eb;
}
</style>
