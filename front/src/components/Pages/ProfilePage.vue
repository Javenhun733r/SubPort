<template>
  <div class="profile-page text-gray-200 py-12 md:py-16 min-h-screen overflow-x-hidden">
    <div v-if="isLoading && !error" class="loading-state">
      <div class="spinner"></div>
      <p>Завантаження даних профілю...</p>
    </div>

    <div v-if="error && !isLoading" class="error-message">
      <strong>Помилка!</strong> {{ error }}
    </div>

    <div v-if="user && !isLoading && !error" class="profile-content-wrapper">
      <section class="user-hero-section">
        <div class="avatar-glow">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="`Аватар ${user.name}`" class="user-avatar">
          <div v-else class="user-avatar-placeholder">
            {{ user.name ? user.name.charAt(0).toUpperCase() : 'P' }}
          </div>
        </div>
        <h1 class="user-name">{{ user.name }}</h1>
        <p class="user-email">{{ user.email }}</p>
        <p v-if="user.balance && parseFloat(user.balance) > 0" class="user-balance">
          На вашому балансі: <strong>{{ user.balance }}</strong> гривень
        </p>
        <p v-else class="user-balance">
          На вашому балансі: <strong>0.00</strong> гривень
        </p>
      </section>

      <div class="content-grid">
        <section v-if="user.balance && parseFloat(user.balance) > 0" class="content-section withdrawal-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2.5 inline-block text-cyan-500/80" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Вивід коштів
          </h2>
          <form @submit.prevent="handleWithdrawal" class="withdrawal-form">
            <div class="form-group">
              <label for="withdrawalAmount" class="form-label">Сума для виводу (грн):</label>
              <input
                  type="number"
                  id="withdrawalAmount"
                  v-model.number="withdrawalAmount"
                  placeholder="Наприклад: 100.00"
                  min="1"
                  :max="user.balance ? parseFloat(user.balance) : 0"
                  step="0.01"
                  class="form-input"
                  required
              />
            </div>
            <div class="form-group">
              <label for="receiverCard" class="form-label">Номер картки (16 цифр):</label>
              <input
                  type="text"
                  id="receiverCard"
                  v-model.trim="receiverCard"
                  placeholder="XXXX XXXX XXXX XXXX"
                  pattern="\d{16}"
                  maxlength="16"
                  class="form-input"
                  required
              />
            </div>

            <div v-if="withdrawalMessage" :class="['withdrawal-feedback', withdrawalError ? 'error' : 'success']">
              {{ withdrawalMessage }}
            </div>

            <button type="submit" class="button-primary" :disabled="withdrawalLoading">
              <span v-if="withdrawalLoading">Обробка...</span>
              <span v-else>Надіслати запит на вивід</span>
            </button>
          </form>
        </section>
        <section v-else class="content-section withdrawal-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2.5 inline-block text-cyan-500/80" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Вивід коштів
          </h2>
          <div class="empty-state">
            <p>Для виводу коштів ваш баланс має бути більшим за нуль.</p>
            <p>Ви можете отримати кошти через донати або підписки від ваших шанувальників.</p>
          </div>
        </section>

        <section class="content-section author-pages-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2.5 inline-block text-cyan-500/80" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 6.253v11.494m0 0a8.485 8.485 0 0011.925 0M12 17.747a8.485 8.485 0 01-11.925 0M12 17.747l-.006-.007M12 17.747l.006-.007m6.169-9.003a8.485 8.485 0 01-11.93 0M12 6.253a8.485 8.485 0 00-5.965 2.484"/>
            </svg>
            Авторські сторінки
          </h2>
          <div v-if="authorPages.length" class="cards-container">
            <div
                v-for="(author, index) in authorPages"
                :key="author.id"
                class="data-card author-card"
                :style="{ '--animation-delay': (index * 0.1) + 's' }"
            >
              <img :src="author.avatarUrl || '/default-avatar.png'" :alt="`Аватар @${author.username}`"
                   class="card-avatar"/>
              <div class="card-info">
                <h3 class="card-title">
                  <router-link :to="`/author/${author.username}`">@{{ author.username }}</router-link>
                </h3>
                <p class="card-subtitle">{{ author.genre }}</p>
              </div>
              <router-link :to="`/author/${author.username}`" class="button-card-action">
                Перейти
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5 inline-block" viewBox="0 0 20 20"
                     fill="currentColor">
                  <path fill-rule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clip-rule="evenodd"/>
                </svg>
              </router-link>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>У вас ще немає авторських сторінок.</p>
            <router-link to="/add-author" class="button-secondary mt-4">Створити першу</router-link>
          </div>
        </section>

        <section class="content-section subscriptions-section">
          <h2 class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2.5 inline-block text-cyan-500/80" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
            Ваші підписки
          </h2>
          <div v-if="subscriptions.length" class="cards-container">
            <div
                v-for="(subscription, index) in subscriptions"
                :key="subscription.id"
                class="data-card subscription-card"
                :style="{ '--animation-delay': (index * 0.1) + 's' }"
            >
              <div class="card-info">
                <h3 class="card-title-main">{{ subscription.tierTitle }}</h3>
                <p class="card-expiry-date">
                  До: {{
                    new Date(subscription.expiresAt).toLocaleDateString('uk-UA', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })
                  }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Немає активних підписок.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted } from 'vue';
import axios from 'axios';

const user = ref(null);
const authorPages = ref([]);
const subscriptions = ref([]);
const isLoading = ref(true);
const error = ref(null);

const withdrawalAmount = ref(null);
const receiverCard = ref('');
const withdrawalLoading = ref(false);
const withdrawalMessage = ref('');
const withdrawalError = ref(false);

const fetchProfileData = async () => {
  isLoading.value = true;
  error.value = null;
  const token = localStorage.getItem('jwt');

  if (!token) {
    error.value = "Сесія завершена. Будь ласка, увійдіть знову.";
    isLoading.value = false;

    return;
  }

  try {
    const res = await axios.get('http://localhost:8081/profile', {
      headers: {Authorization: `Bearer ${token}`},
    });
    const data = res.data;
    user.value = data.user;
    authorPages.value = data.authorPages || [];
    subscriptions.value = data.subscriptions || [];
  } catch (err) {
    console.error('Помилка завантаження профілю:', err.response || err.message);
    if (err.response) {
      error.value = `Помилка ${err.response.status}: Не вдалося завантажити дані. ${err.response.data.message || ''}`;
      if (err.response.status === 401 || err.response.status === 403) {

      }
    } else if (err.request) {
      error.value = 'Немає відповіді від сервера. Перевірте інтернет або спробуйте пізніше.';
    } else {
      error.value = 'Сталася непередбачена помилка під час завантаження профілю.';
    }
  } finally {
    isLoading.value = false;
  }
};

const handleWithdrawal = async () => {
  withdrawalLoading.value = true;
  withdrawalMessage.value = '';
  withdrawalError.value = false;

  if (!withdrawalAmount.value || withdrawalAmount.value <= 0) {
    withdrawalMessage.value = 'Будь ласка, введіть коректну суму для виводу.';
    withdrawalError.value = true;
    withdrawalLoading.value = false;
    return;
  }
  if (!receiverCard.value || !/^\d{16}$/.test(receiverCard.value)) {
    withdrawalMessage.value = 'Будь ласка, введіть коректний 16-значний номер картки.';
    withdrawalError.value = true;
    withdrawalLoading.value = false;
    return;
  }
  if (user.value && withdrawalAmount.value > parseFloat(user.value.balance)) {
    withdrawalMessage.value = 'Сума виводу перевищує ваш поточний баланс.';
    withdrawalError.value = true;
    withdrawalLoading.value = false;
    return;
  }

  const token = localStorage.getItem('jwt');
  if (!token) {
    withdrawalMessage.value = "Сесія завершена. Будь ласка, увійдіть знову, щоб вивести кошти.";
    withdrawalError.value = true;

    withdrawalLoading.value = false;
    return;
  }

  try {

    const response = await axios.post('http://localhost:8081/api/withdrawal', {
      amount: withdrawalAmount.value,
      receiverCard: receiverCard.value,
    }, {
      headers: {Authorization: `Bearer ${token}`},
    });

    withdrawalMessage.value = response.data.message || 'Запит на вивід успішно надіслано та прийнято LiqPay для обробки.';
    withdrawalError.value = false;
    withdrawalAmount.value = null;
    receiverCard.value = '';

    setTimeout(() => {
      fetchProfileData();
    }, 10000);

  } catch (err) {
    console.error('Помилка при створенні запиту на вивід:', err.response || err.message);
    if (err.response) {
      withdrawalMessage.value = `Помилка ${err.response.status}: ${err.response.data.message || 'Не вдалося обробити запит на вивід.'}`;
    } else if (err.request) {
      withdrawalMessage.value = 'Немає відповіді від сервера при спробі виводу коштів.';
    } else {
      withdrawalMessage.value = 'Сталася непередбачена помилка під час запиту на вивід.';
    }
    withdrawalError.value = true;
  } finally {
    withdrawalLoading.value = false;
  }
};

onMounted(fetchProfileData);
</script>

<style scoped>

.profile-page {
  font-family: "Raleway", sans-serif;
  padding-left: 1rem;
  padding-right: 1rem;
}

.withdrawal-section {

  animation: fadeInSlideUp 0.6s ease-out 0.7s backwards;
}

.withdrawal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: rgba(30, 35, 58, 0.65);
  backdrop-filter: blur(8px) saturate(130%);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 247, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  color: #a0aec0;
  margin-bottom: 0.3rem;
}

.form-input {
  background-color: rgba(17, 24, 39, 0.8);
  border: 1px solid rgba(55, 65, 81, 0.7);
  color: #e5e7eb;
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #00f7ff;
  box-shadow: 0 0 0 2px rgba(0, 247, 255, 0.2);
}

.form-input::placeholder {
  color: #6b7280;
}

.button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 150, 255, 0.25);
  cursor: pointer;
}

.button-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 150, 255, 0.35);
  background: linear-gradient(90deg, #00d2ff, #007eff);
}

.button-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.withdrawal-feedback {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
}

.withdrawal-feedback.success {
  background-color: rgba(22, 163, 74, 0.15);
  color: #a7f3d0;
  border: 1px solid rgba(22, 163, 74, 0.3);
}

.withdrawal-feedback.error {
  background-color: rgba(220, 38, 38, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(220, 38, 38, 0.3);
}


.loading-state, .error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 247, 255, 0.2);
  border-top-color: #00f7ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background-color: rgba(255, 70, 70, 0.05);
  border: 1px solid rgba(255, 70, 70, 0.2);
  padding: 1.5rem;
  border-radius: 12px;
  color: #ffc5c5;
}

.error-message strong {
  color: #ff9a9a;
}

@keyframes fadeInSlideUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
}

.user-hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1rem;
  margin-bottom: 3rem;
  background-color: rgba(40, 48, 70, 0.3);
  backdrop-filter: blur(5px) saturate(120%);
  border-radius: 20px;
  border: 1px solid rgba(0, 247, 255, 0.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  animation: fadeInSlideUp 0.8s ease-out;
}

.user-balance strong {
  color: #00f7ff;
  font-weight: 700;
}

.avatar-glow {
  position: relative;
  margin-bottom: 1.5rem;
}

.avatar-glow::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  background: conic-gradient(from 90deg at 50% 50%, #00f7ff, #6f42c1, #e83e8c, #00f7ff);
  filter: blur(12px);
  opacity: 0.5;
  animation: spin 5s linear infinite;
}

.user-avatar, .user-avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #121828;
  position: relative;
  z-index: 1;
  background-color: #232a44;
  box-shadow: 0 0 10px rgba(0, 247, 255, 0.2);
}

.user-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: #00f7ff;
}

.user-name {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  margin-bottom: 0.3rem;
}

.user-email {
  font-size: 0.95rem;
  color: #e1dede;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem 2.5rem;
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.content-section {
  animation: fadeInSlideUp 0.6s ease-out 0.3s backwards;
}

.content-section:nth-child(2) {
  animation-delay: 0.5s;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00f7ff;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 247, 255, 0.1);
  display: flex;
  align-items: center;
}

.section-title svg {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.625rem;
  opacity: 0.7;
}

.cards-container {
  display: grid;
  gap: 1.25rem;
}

.data-card {
  background-color: rgba(30, 35, 58, 0.65);
  backdrop-filter: blur(8px) saturate(130%);
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(0, 247, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInSlideUp 0.5s ease-out forwards;
  display: flex;
  flex-direction: column;
}

.data-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 247, 255, 0.12);
  border-color: rgba(0, 247, 255, 0.25);
}

.author-card {
  align-items: center;
}

@media (min-width: 640px) {
  .author-card {
    flex-direction: row;
    text-align: left;
  }
}

.card-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 247, 255, 0.15);
  margin-bottom: 0.75rem;
  box-shadow: 0 0 6px rgba(0, 247, 255, 0.1);
}

@media (min-width: 640px) {
  .author-card .card-avatar {
    margin-right: 0.75rem;
    margin-bottom: 0;
  }
}

.card-info {
  flex-grow: 1;
  text-align: center;
}

@media (min-width: 640px) {
  .author-card .card-info {
    text-align: left;
  }
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #00f7ff;
  margin-bottom: 0.1rem;
  transition: color 0.3s ease;
}

.card-title a:hover {
  color: #8effff;
}

.card-title-main {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f0f0f0;
  margin-bottom: 0.2rem;
}

.card-subtitle, .card-expiry-date {
  font-size: 0.8rem;
  color: #a0aec0;
}

.card-expiry-date {
  margin-top: 0.2rem;
  color: #cbd5e0;
}

.button-card-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.75rem;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(90deg, #00b8c0, #2a4db1);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 1px 6px rgba(0, 180, 180, 0.1);
}

.button-card-action svg {
  width: 0.9rem;
  height: 0.9rem;
  margin-left: 0.3rem;
}

.button-card-action:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 2px 10px rgba(0, 200, 200, 0.2);
  background: linear-gradient(90deg, #1bdde6, #4769d1);
}

@media (min-width: 640px) {
  .author-card .button-card-action {
    margin-top: 0;
    margin-left: auto;
  }
}

.empty-state {
  background-color: rgba(30, 35, 58, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  border: 1px dashed rgba(0, 247, 255, 0.1);
  animation: fadeInSlideUp 0.5s ease-out 0.2s backwards;
}

.empty-state p {
  color: #1c422c;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.button-secondary {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #00f7ff;
  border: 1px solid #00f7ff;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.button-secondary {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #00f7ff;
  border: 1px solid #00f7ff;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.button-secondary:hover {
  background-color: rgba(0, 247, 255, 0.05);
  color: #adf9fb;
  transform: translateY(-1px);
  box-shadow: 0 1px 6px rgba(0, 247, 255, 0.1);
}
</style>