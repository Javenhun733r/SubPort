<template>
  <div class="admin-requests-page min-h-screen p-6 sm:p-8">
    <h1 class="page-title">
      <svg xmlns="http://www.w3.org/2000/svg" class="title-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      <span>Заявки на створення сторінки автора</span>
    </h1>

    <div v-if="isLoading" class="loading-state">
      <svg class="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-3 text-gray-400">Завантаження заявок...</p>
    </div>

    <div v-if="error && !isLoading" class="error-message max-w-2xl mx-auto" role="alert">
      <strong class="font-bold block sm:inline">Помилка!</strong>
      <span class="block sm:inline"> {{ error }}</span>
    </div>

    <div v-if="!isLoading && !error && requests.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      <p class="text-xl text-cyan-400">Наразі немає активних заявок</p>
      <p class="text-cyan-600">Коли з'являться нові, вони будуть відображені тут. 😌</p>

    </div>

    <div v-if="!isLoading && !error && requests.length > 0" class="requests-grid">
      <div
          v-for="request in requests"
          :key="request.id"
          class="request-card group"
      >
        <div class="card-header">
          <img
              v-if="request.avatarFile"
              :src="request.avatarFile" :alt="`Аватар ${request.name}`"
              class="card-avatar"
          />
          <div v-else class="card-avatar-placeholder">
            {{ request.name ? request.name.charAt(0).toUpperCase() : '?' }}
          </div>
          <div class="card-header-info">
            <h2 class="card-title">{{ request.name }}</h2>
            <p class="card-username">@{{ request.username }}</p>
          </div>
        </div>

        <div class="card-body">
          <div v-if="request.bio" class="info-block bio-block">
            <p>"{{ request.bio }}"</p>
          </div>
          <div class="info-block"><span class="info-label">Жанр:</span> {{ request.genre }}</div>
          <div class="info-block"><span class="info-label">Email:</span> {{ request.user.email }}</div>
        </div>

        <div class="card-actions">
          <button @click="approve(request.id)" class="button-approve" :disabled="request.isProcessing">
            <span v-if="request.isProcessing === 'approve'">Обробка...</span>
            <span v-else>✅ Схвалити</span>
          </button>
          <button @click="reject(request.id)" class="button-reject" :disabled="request.isProcessing">
            <span v-if="request.isProcessing === 'reject'">Обробка...</span>
            <span v-else>❌ Відхилити</span>
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
      requests: [],
      token : localStorage.getItem('jwt'),
      isLoading: true,
      error: null,
    }
  },
  async created() {
    await this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await axios.get('http://localhost:8081/requests', { // Додано headers, якщо вони потрібні для цього запиту
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.requests = res.data.map(r => ({ ...r, isProcessing: null })); // Додаємо поле для стану обробки
      } catch (err) {
        console.error('Помилка при завантаженні заявок:', err);
        this.error = "Не вдалося завантажити заявки. Спробуйте пізніше.";
      } finally {
        this.isLoading = false;
      }
    },
    setRequestProcessing(id, type) {
      const request = this.requests.find(r => r.id === id);
      if (request) request.isProcessing = type;
    },
    clearRequestProcessing(id) {
      const request = this.requests.find(r => r.id === id);
      if (request) request.isProcessing = null;
    },
    async approve(id) {
      if (this.requests.find(r => r.id === id && r.isProcessing)) return; // Запобігання подвійному кліку
      this.setRequestProcessing(id, 'approve');
      try {
        await axios.post(`http://localhost:8081/requests/approve/${id}`, {}, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.requests = this.requests.filter(r => r.id !== id);
      } catch (err) {
        console.error('Помилка при схваленні заявки:', err);
        // Тут можна показати повідомлення про помилку для конкретної картки
        alert('Не вдалося схвалити заявку.');
        this.clearRequestProcessing(id);
      }
    },
    async reject(id) {
      if (this.requests.find(r => r.id === id && r.isProcessing)) return;
      this.setRequestProcessing(id, 'reject');
      try {
        await axios.delete(`http://localhost:8081/requests/reject/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.requests = this.requests.filter(r => r.id !== id);
      } catch (err) {
        console.error('Помилка при відхиленні заявки:', err);
        alert('Не вдалося відхилити заявку.');
        this.clearRequestProcessing(id);
      }
    }
  }
}
</script>

<style scoped>
/* Припускаємо, що глобальний фон #121828 та шрифт "Raleway" встановлені */
.admin-requests-page {
  background: transparent;
  font-family: "Raleway", sans-serif;
  color: #e0e0e0;

}

.page-title {
  font-size: 1.8rem; /* Зменшено розмір для балансу */
  font-weight: 600; /* Трохи менш жирний */
  text-align: center;
  color: #00f7ff;
  margin-bottom: 2rem; /* Зменшено відступ */
  padding-bottom: 0.5rem;
  display: flex; /* Для вирівнювання іконки та тексту */
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 8px rgba(0, 247, 255, 0.2); /* Менш інтенсивна тінь */
}
@media (min-width: 640px) {
  .page-title {
    font-size: 2.1rem; /* Трохи більший на десктопах */
  }
}
.title-icon {
  width: 1.75rem; /* h-7 w-7, значно зменшено */
  height: 1.75rem;
  margin-right: 0.75rem; /* Відступ від тексту */
  color: #00f7ff; /* Колір іконки */
  opacity: 0.8; /* Трохи менш яскрава, ніж текст */
  flex-shrink: 0; /* Щоб іконка не стискалася */
}

.loading-state, .empty-state, .error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  margin-top: 1.5rem;
  text-align: center;
  border-radius: 12px;
}
.empty-state {
  background-color: rgba(30, 35, 58, 0.3);
  border: 1px dashed rgba(0, 247, 255, 0.15);
}
.error-message {
  background-color: rgba(255, 70, 70, 0.05);
  border: 1px solid rgba(255, 70, 70, 0.2);
  color: #ffc5c5;
}
.error-message strong { color: #ff9a9a; }
.loading-state svg, .empty-state svg {
  width: 3rem; height: 3rem; margin-bottom: 1rem;
}
.empty-state svg { color: #6b7f99; }
.loading-state p, .empty-state p { font-size: 2rem; color: #00f4cb; }
.empty-state p:last-child { font-size: 1.5rem; color: #65ddce; }

.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* Адаптивні картки */
  gap: 2rem;
}

.request-card {
  background-color: rgba(30, 35, 58, 0.65); /* "Скляний" фон */
  backdrop-filter: blur(10px) saturate(140%);
  border-radius: 16px; /* rounded-2xl */
  border: 1px solid rgba(0, 247, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden; /* Важливо для внутрішніх заокруглень та позиціонування */
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
}
.request-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 247, 255, 0.15);
  border-color: rgba(0, 247, 255, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem; /* space-x-4 */
  padding: 1.25rem; /* p-5 */
  background-color: rgba(0, 247, 255, 0.03); /* Легкий акцентний фон для хедера */
  border-bottom: 1px solid rgba(0, 247, 255, 0.1);
}

.card-avatar, .card-avatar-placeholder {
  width: 4rem; /* w-16 */
  height: 4rem; /* h-16 */
  border-radius: 50%; /* rounded-full */
  object-fit: cover;
  border: 2px solid #00f7ff; /* ring-2 ring-cyan-500 */
  flex-shrink: 0; /* Щоб аватар не стискався */
}
.card-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #232a44;
  font-size: 1.75rem;
  font-weight: bold;
  color: #00f7ff;
}


.card-header-info {
  min-width: 0; /* Дозволяє тексту обрізатися, якщо він занадто довгий */
}
.card-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 700; /* font-bold */
  color: #e5e7eb; /* text-gray-100 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-username {
  font-size: 0.875rem; /* text-sm */
  color: #9ca3af; /* text-gray-400 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-body {
  padding: 1.25rem; /* p-5 */
  font-size: 0.875rem; /* text-sm */
  color: #d1d5db; /* text-gray-300 */
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* space-y-3 */
  flex-grow: 1; /* Щоб тіло картки займало доступний простір */
}

.info-block {
  line-height: 1.5;
}
.bio-block {
  font-style: italic;
  color: #9ca3af; /* text-gray-400 */
  border-left: 3px solid rgba(0, 247, 255, 0.3); /* border-l-4 border-cyan-500/70 */
  padding-left: 0.75rem; /* pl-3 */
  max-height: 100px; /* Обмеження висоти біографії */
  overflow-y: auto; /* Додавання скролу, якщо біографія довга */
  scrollbar-width: thin; /* Для Firefox */
  scrollbar-color: rgba(0, 247, 255, 0.3) transparent; /* Для Firefox */
}
/* Стилізація скролбару для Webkit (Chrome, Safari, Edge) */
.bio-block::-webkit-scrollbar {
  width: 6px;
}
.bio-block::-webkit-scrollbar-track {
  background: transparent;
}
.bio-block::-webkit-scrollbar-thumb {
  background-color: rgba(0, 247, 255, 0.2);
  border-radius: 3px;
}
.bio-block::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 247, 255, 0.4);
}


.info-label {
  font-weight: 600; /* font-semibold */
  color: #00f7ff; /* text-cyan-400 */
  margin-right: 0.25rem;
}

.card-actions {
  padding: 1rem 1.25rem; /* p-4 pt-0 -> p-5 (зверху менше, знизу більше) */
  display: flex;
  gap: 1rem; /* space-x-4 */
  border-top: 1px solid rgba(0, 247, 255, 0.1);
  margin-top: auto; /* Притискає кнопки до низу картки */
}

.button-approve, .button-reject {
  flex: 1;
  color: #ffffff;
  font-weight: 600; /* font-semibold */
  padding: 0.625rem 0; /* py-2.5 */
  border-radius: 10px; /* rounded-lg */
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.button-approve:hover:not(:disabled), .button-reject:hover:not(:disabled) {
  transform: translateY(-2px);
}
.button-approve:disabled, .button-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


.button-approve {
  background-color: #28a745; /* Зелений */
}
.button-approve:hover:not(:disabled) {
  background-color: #218838;
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
}

.button-reject {
  background-color: #dc3545; /* Червоний */
}
.button-reject:hover:not(:disabled) {
  background-color: #c82333;
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);
}
</style>