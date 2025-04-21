<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-8">
    <h1 class="text-4xl font-bold text-center text-indigo-800 mb-10">Заявки на створення сторінки автора</h1>

    <div v-if="requests.length === 0" class="text-center text-gray-600 text-lg">
      Наразі немає активних заявок 😌
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
          v-for="request in requests"
          :key="request.id"
          class="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition duration-300"
      >
        <div class="flex items-center gap-4 mb-4">
          <img
              v-if="request.avatarFile"
              :src="`/uploads/${request.avatarFile}`"
              alt="avatar"
              class="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <h2 class="text-xl font-semibold text-indigo-700">{{ request.name }}</h2>
            <p class="text-sm text-gray-500">@{{ request.username }}</p>
          </div>
        </div>
        <div class="text-sm text-gray-700 mb-4">{{ request.bio }}</div>
        <div class="text-sm text-gray-500 mb-2">Жанр: <span class="font-medium">{{ request.genre }}</span></div>
        <div class="text-sm text-gray-500 mb-6">Email: <span class="font-medium">{{ request.user.email }}</span></div>

        <div class="flex gap-3">
          <button
              @click="approve(request.id)"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition"
          >
            ✅ Схвалити
          </button>
          <button
              @click="reject(request.id)"
              class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition"
          >
            ❌ Відхилити
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      requests: []
    }
  },
  async created() {
    await this.fetchRequests()
  },
  methods: {
    async fetchRequests() {
      try {
        const res = await axios.get('http://localhost:8081/requests')
        this.requests = res.data
      } catch (err) {
        console.error('Помилка при завантаженні заявок:', err)
      }
    },
    async approve(id) {
      await axios.post(`http://localhost:8081/requests/approve/${id}`)
      this.requests = this.requests.filter(r => r.id !== id)
    },
    async reject(id) {
      await axios.post(`http://localhost:8081/requests/reject/${id}`)
      this.requests = this.requests.filter(r => r.id !== id)
    }
  }
}
</script>

<style scoped>
/* Трохи додаткової плавності */
button {
  transition: transform 0.2s ease;
}
button:hover {
  transform: scale(1.03);
}
</style>
