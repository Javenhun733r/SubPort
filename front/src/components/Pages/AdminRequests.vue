<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 p-8">
    <h1 class="text-4xl font-bold text-center text-indigo-800 mb-10">
      📄 Заявки на створення сторінки автора
    </h1>

    <div v-if="requests.length === 0" class="text-center text-gray-600 text-lg">
      Наразі немає активних заявок 😌
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
          v-for="request in requests"
          :key="request.id"
          class="relative rounded-3xl shadow-xl border-4 border-indigo-300 bg-white overflow-hidden group transition-all hover:scale-[1.01] duration-300"
      >
        <!-- Вміст картки -->
        <div class="card bg-white rounded-2xl overflow-hidden">
          <!-- Верхня частина -->
          <div class="bg-indigo-50 p-6 pb-4 flex items-center gap-4">
            <img
                v-if="request.avatarFile"
                :src="`/uploads/${request.avatarFile}`"
                alt="avatar"
                class="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500"
            />
            <div>
              <h2 class="text-xl font-bold text-indigo-800">{{ request.name }}</h2>
              <p class="text-sm text-gray-500">@{{ request.username }}</p>
            </div>
          </div>

          <!-- Основна інформація -->
          <div class="p-6 pt-2 text-sm text-gray-700 space-y-3">
            <div class="italic text-gray-600 border-l-4 border-indigo-300 pl-4">"{{ request.bio }}"</div>
            <div><span class="font-semibold text-indigo-600">Жанр:</span> {{ request.genre }}</div>
            <div><span class="font-semibold text-indigo-600">Email:</span> {{ request.user.email }}</div>
          </div>

          <!-- Кнопки -->
          <div class="p-6 pt-0 flex gap-4">
            <button
                @click="approve(request.id)"
                class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl shadow-md transition"
            >
              ✅ Схвалити
            </button>
            <button
                @click="reject(request.id)"
                class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl shadow-md transition"
            >
              ❌ Відхилити
            </button>
          </div>
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
.card{
  border: 4px solid #a5b4fc; /* Tailwind indigo-300 */
  border-radius: 1.5rem;
  text-align: center;
  width: 80%;
  margin: 10px auto;
}
</style>
