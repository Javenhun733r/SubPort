<template>
  <div class="max-w-2xl mx-auto p-6">
    <!-- Профіль користувача -->
    <div v-if="user" class="user-data bg-white shadow-md rounded-xl p-6 mb-10 border border-gray-200">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ user.name }}</h1>
      <p class="text-gray-600 text-lg">{{ user.email }}</p>
    </div>

    <!-- Авторські сторінки -->
    <h2 v-if="authorPages.length" class="text-2xl font-semibold text-gray-800 mb-6">Ваші авторські сторінки</h2>
    <div class="space-y-6">
      <div
          v-for="author in authorPages"
          :key="author.id"
          class="author-card bg-white rounded-lg p-5 flex items-center transition"
      >
        <img
            :src="author.avatarUrl || '/default-avatar.png'"
            alt="avatar"
            class="w-20 h-20 rounded-full object-cover mr-6 border-2 border-gray-300"
        />
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-800">@{{ author.username }}</h3>
          <p class="text-gray-500">{{ author.genre }}</p>
        </div>
        <a
            :href="`/author/${author.username}`"
            class="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Перейти
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref(null);
const authorPages = ref([]);

const token = localStorage.getItem('jwt');

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8081/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res.data;
    user.value = data.user;
    authorPages.value = data.authorPages;
  } catch (err) {
    console.error('Помилка завантаження профілю:', err);
  }
});
</script>

<style scoped>
body {
  background-color: #f9fafb;
}

.user-data {
  text-align: center;
}

/* Рамка для картки */
.author-card {
  border: 2px solid #e5e7eb; /* Tailwind's gray-200 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  background-color: #ffffff;
  width: 50vh;
  align-items: center;
}

.author-card:hover {
  border-color: #3b82f6; /* Tailwind's blue-500 */
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.2);
}
</style>
