<template>
  <div class="signup-page-wrapper">
    <div class="signup-form-container">
      <div class="logo-container">
        <h2 class="signup-title">Створення акаунту</h2>
      </div>

      <form @submit.prevent="signup" class="space-y-6">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div v-if="showMessage && !errorMessage" class="success-message">
          <p>Чудово! Будь ласка, перевірте вашу пошту (<span class="font-semibold">{{ emailForConfirmation }}</span>), щоб підтвердити акаунт.</p>
          <p class="text-xs mt-2 text-gray-400">Перенаправлення на головну сторінку відбудеться за {{ countdown }} секунд...</p>
        </div>

        <div class="form-group">
          <label for="email">Електронна пошта</label>
          <input type="email" id="email" v-model="email" class="input-field" placeholder="your@email.com" required @input="clearMessages">
        </div>
        <div class="form-group">
          <label for="name">Логін (нікнейм)</label>
          <input type="text" id="name" v-model="name" class="input-field" placeholder="Ваш унікальний нікнейм" required @input="clearMessages">
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" v-model="password" class="input-field" placeholder="Мінімум 8 символів" required @input="clearMessages">
        </div>
        <button type="submit" class="cta-button" :disabled="isLoading || showMessage">
          <span v-if="isLoading" class="button-loader"></span>
          <span v-else>Зареєструватися</span>
        </button>
      </form>

      <div class="extra-links">
        <p class="text-gray-400 text-sm">
          Вже маєте акаунт? <router-link to="/login" class="extra-link highlight">Увійти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      // confirmPassword: "", // Якщо додали поле підтвердження
      isLoading: false,
      errorMessage: "",
      showMessage: false,
      emailForConfirmation: "", // Для відображення пошти у повідомленні
      countdown: 5,
      countdownInterval: null,
    };
  },
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  },
  methods: {
    clearMessages() {
      this.errorMessage = "";
      // Не скидаємо showMessage, щоб користувач бачив повідомлення про підтвердження
    },
    startCountdown() {
      this.countdown = 5;
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown === 0) {
          clearInterval(this.countdownInterval);
          this.$router.push('/main').then(() => { // Або '/items', як у вас було
            window.location.reload(); // Для оновлення стану Navbar
          });
        }
      }, 1000);
    },
    async signup() {
      this.isLoading = true;
      this.errorMessage = "";
      this.showMessage = false;

      // Додайте валідацію тут, якщо потрібно (наприклад, довжина пароля, співпадіння паролів)
      // if (this.password !== this.confirmPassword) {
      //   this.errorMessage = "Паролі не співпадають.";
      //   this.isLoading = false;
      //   return;
      // }

      const userData = {
        name: this.name,
        email: this.email,
        password: this.password,
      };

      try {
        const response = await axios.post("http://localhost:8081/register", userData);
        // Припускаємо, що сервер повертає токен тільки після успішної реєстрації та не вимагає негайного підтвердження для видачі токена
        // Якщо токен видається тільки ПІСЛЯ підтвердження пошти, то логіка localStorage.setItem буде іншою.
        const token = response.data.token;

        this.showMessage = true; // Показуємо повідомлення про підтвердження пошти
        this.emailForConfirmation = this.email; // Зберігаємо пошту для повідомлення

        if (token) {
          localStorage.setItem("jwt", token);
          // console.log("JWT збережено після реєстрації:", token);
        } else {
          // console.warn("JWT не отримано відразу після реєстрації, очікується підтвердження пошти.");
          // Це нормально, якщо ваш бекенд не видає токен до підтвердження.
        }
        this.startCountdown(); // Запускаємо зворотній відлік для редіректу

      } catch (error) {
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message || "Помилка реєстрації. Спробуйте інші дані.";
        } else if (error.request) {
          this.errorMessage = "Сервер не відповідає. Спробуйте пізніше.";
        } else {
          this.errorMessage = "Сталася невідома помилка під час реєстрації.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Припускаємо, що глобальний фон #121828 та шрифт "Raleway" встановлені */

.signup-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Raleway", sans-serif;
}

.signup-form-container {
  background-color: rgba(30, 35, 58, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(0, 247, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  max-width: 450px; /* Трохи ширше для додаткових полів */
  width: 100%;
  text-align: left;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-logo {
  max-width: 150px;
  margin-bottom: 1rem;
}

.signup-title {
  color: #00f7ff;
  font-size: 2.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.25rem; /* Зменшено відступ для компактності */
}

label {
  display: block;
  color: #a0aec0;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  background-color: rgba(10, 15, 35, 0.6);
  border: 1px solid rgba(0, 247, 255, 0.2);
  color: #e0e0e0;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-field::placeholder {
  color: #718096;
}

.input-field:focus {
  outline: none;
  border-color: #00f7ff;
  background-color: rgba(10, 15, 35, 0.8);
  box-shadow: 0 0 0 3px rgba(0, 247, 255, 0.15);
}

.cta-button {
  width: 100%;
  padding: 0.875rem 1rem;
  background: linear-gradient(90deg, #28a745, #20c997); /* Зелений градієнт для реєстрації */
  color: #ffffff; /* Білий текст для зеленої кнопки */
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1.05rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.25); /* Тінь для зеленої кнопки */
  background: linear-gradient(90deg, #2ebf4f, #25d3a0);
}

.cta-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-loader {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff; /* Білий для зеленої кнопки */
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: button-rotation 1s linear infinite;
}

@keyframes button-rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message, .success-message {
  color: #ff9a9a;
  background-color: rgba(255, 0, 0, 0.05);
  border: 1px solid rgba(255, 0, 0, 0.15);
  padding: 0.85rem 1rem; /* Узгоджено падінги */
  border-radius: 8px;
  margin-bottom: 1.25rem;
  text-align: center;
  font-size: 0.875rem;
}

.success-message {
  color: #c1f0d9; /* Світло-зелений текст */
  background-color: rgba(40, 167, 69, 0.1); /* Напівпрозорий зелений фон */
  border: 1px solid rgba(40, 167, 69, 0.2); /* Зелена рамка */
}

.extra-links {
  margin-top: 1.5rem; /* Зменшено відступ */
  text-align: center;
  font-size: 0.875rem;
}

.extra-link {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s ease;
}

.extra-link:hover {
  color: #00f7ff;
  text-decoration: underline;
}

.extra-link.highlight {
  color: #00f7ff;
  font-weight: 600;
}

.extra-links p {
  margin-top: 0.5rem; /* Менший відступ між посиланнями */
}
</style>