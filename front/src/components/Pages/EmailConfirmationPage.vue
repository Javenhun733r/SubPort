<template>
  <div class="verification-page-wrapper">
    <div class="message-card">
      <div v-if="loading" class="status-section loading-state">
        <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="status-text">Перевірка вашої електронної пошти...</p>
        <p class="status-subtext">Будь ласка, зачекайте хвилинку.</p>
      </div>
      <div v-else>
        <div v-if="success" class="status-section success-state">
          <svg class="status-icon success-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="status-title">Пошту підтверджено!</h2>
          <p class="status-text">Ваша електронна адреса успішно підтверджена.</p>
          <p class="status-subtext">Тепер ви можете увійти до свого акаунту.</p>
          <router-link to="/login" class="cta-button mt-8">Перейти до входу</router-link>
        </div>
        <div v-else class="status-section error-state">
          <svg class="status-icon error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 class="status-title">Помилка підтвердження</h2>
          <p class="status-text">{{ error }}</p>
          <p class="status-subtext">Будь ласка, спробуйте перейти за посиланням з листа ще раз або зверніться до підтримки.</p>
          <router-link to="/" class="cta-button-outline mt-8">На головну</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EmailVerificationPage',
  data() {
    return {
      loading: true,
      success: false,
      error: 'Сталася невідома помилка.', // Повідомлення за замовчуванням
    };
  },
  methods: {
    async verifyEmail() {
      const token = this.$route.params.token;
      if (!token) {
        this.error = "Відсутній токен підтвердження. Будь ласка, перевірте посилання з листа.";
        this.loading = false;
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8081/verify-email/${token}`);
        if (response.status === 200 && response.data.message) {
          this.success = true;
          this.error = ''; // Очищаємо помилку при успіху
        } else {
          // Якщо відповідь 200, але немає data.message або інший формат успішної відповіді
          this.error = response.data.error || "Не вдалося підтвердити електронну пошту. Некоректна відповідь сервера.";
          this.success = false;
        }
      } catch (err) {
        console.error("Помилка верифікації:", err.response || err.message || err);
        this.success = false;
        if (err.response && err.response.data && err.response.data.error) {
          this.error = err.response.data.error;
        } else if (err.response && err.response.data && err.response.data.message) {
          this.error = err.response.data.message; // Якщо сервер повертає помилку в полі message
        } else if (err.response && err.response.status) {
          this.error = `Помилка ${err.response.status}. Спробуйте, будь ласка, пізніше.`;
        }
        else {
          this.error = "Сталася помилка під час з'єднання з сервером. Перевірте ваше інтернет-з'єднання.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.verifyEmail();
  },
};
</script>

<style scoped>
/* Припускаємо, що глобальний фон #121828 та шрифт "Raleway" встановлені */
.verification-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Raleway", sans-serif;
  /* Якщо глобальний фон не встановлено, розкоментуйте: */
  /* background-color: #121828; */
  color: #e0e0e0;
}

.message-card {
  background-color: rgba(30, 35, 58, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  border-radius: 16px;
  padding: 2.5rem 2rem; /* Адаптовано падінги */
  border: 1px solid rgba(0, 247, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  max-width: 500px;
  width: 100%;
  text-align: center;
}
@media (min-width: 640px) {
  .message-card {
    padding: 3rem 3.5rem;
  }
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner-icon {
  width: 3.5rem; /* w-14 */
  height: 3.5rem; /* h-14 */
  color: #00f7ff; /* cyan-400 */
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-icon {
  width: 4.5rem; /* w-18 */
  height: 4.5rem; /* h-18 */
  margin-bottom: 1.25rem; /* mb-5 */
}
.success-icon {
  color: #34d399; /* Tailwind emerald-400 або green-400 */
}
.error-icon {
  color: #f87171; /* Tailwind red-400 */
}

.status-title {
  font-size: 1.75rem; /* text-2xl або text-3xl */
  font-weight: 600;
  margin-bottom: 0.75rem; /* mb-3 */
  color: #ffffff;
}
.success-state .status-title {
  color: #a7f3d0; /* Світло-зелений для заголовку успіху */
}
.error-state .status-title {
  color: #fca5a5; /* Світло-червоний для заголовку помилки */
}

.status-text {
  font-size: 1.125rem; /* text-lg */
  color: #cbd5e1; /* gray-300 */
  line-height: 1.6;
}
.loading-state .status-text {
  margin-top: 1.5rem;
  color: #9ca3af; /* gray-400 */
}

.status-subtext {
  font-size: 0.875rem; /* text-sm */
  color: #9ca3af; /* gray-400 */
  margin-top: 0.5rem; /* mb-2 */
}

.cta-button {
  display: inline-block;
  margin-top: 2rem; /* mt-8 */
  padding: 0.75rem 2rem; /* py-3 px-8 */
  background: linear-gradient(90deg, #00f7ff, #3675f4);
  color: #121828;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 220, 220, 0.25);
  background: linear-gradient(90deg, #23ffff, #538dff);
}

.cta-button-outline {
  display: inline-block;
  margin-top: 2rem; /* mt-8 */
  padding: 0.75rem 2rem;
  background-color: transparent;
  color: #00f7ff;
  border: 2px solid #00f7ff;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 1rem;
}
.cta-button-outline:hover {
  background-color: rgba(0, 247, 255, 0.1);
  color: #adf9fb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 247, 255, 0.15);
}

</style>