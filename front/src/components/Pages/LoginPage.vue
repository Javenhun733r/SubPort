<template>
  <div class="login-page-wrapper">
    <div class="login-form-container">
      <div class="logo-container">
        <h2 class="login-title">Вхід до SubPort</h2>
      </div>

      <form @submit.prevent="login" class="space-y-6">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="email">Електронна пошта</label>
          <input type="email" id="email" v-model="email" class="input-field" placeholder="your@email.com" required
                 @input="clearError">
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" v-model="password" class="input-field" placeholder="••••••••" required
                 @input="clearError">
        </div>

        <button type="submit" class="cta-button" :disabled="isLoading">
          <span v-if="isLoading" class="button-loader"></span>
          <span v-else>Увійти</span>
        </button>
      </form>

      <div class="extra-links">
        <router-link to="/forgot-password" class="extra-link">Забули пароль?</router-link>
        <p class="text-gray-400 text-sm">
          Немає акаунту?
          <router-link to="/signup" class="extra-link highlight">Зареєструватися</router-link>
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
      email: "",
      password: "",
      isLoading: false,
      errorMessage: ""
    };
  },
  methods: {
    clearError() {
      this.errorMessage = "";
    },
    async login() {
      this.isLoading = true;
      this.errorMessage = "";
      const userData = {
        email: this.email,
        password: this.password,
      };

      try {
        const response = await axios.post("http://localhost:8081/login", userData);
        const token = response.data.token;

        if (token) {
          localStorage.setItem("jwt", token);

          this.$router.push('/main').then(() => {

            window.location.reload();
          });

        } else {
          this.errorMessage = "Не вдалося отримати токен авторизації.";

        }
      } catch (error) {

        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message || "Помилка входу. Перевірте дані та спробуйте знову.";
        } else if (error.request) {
          this.errorMessage = "Сервер не відповідає. Спробуйте пізніше.";
        } else {
          this.errorMessage = "Сталася невідома помилка.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>

.login-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Raleway", sans-serif;
}

.login-form-container {
  background-color: rgba(30, 35, 58, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(0, 247, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  max-width: 420px;
  width: 100%;
  text-align: left;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  max-width: 150px;
  margin-bottom: 1rem;
}

.login-title {
  color: #00f7ff;
  font-size: 2.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
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
  background: linear-gradient(90deg, #00f7ff, #3675f4);
  color: #121828;
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
  box-shadow: 0 6px 20px rgba(0, 220, 220, 0.25);
  background: linear-gradient(90deg, #23ffff, #538dff);
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
  border: 2px solid #121828;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: button-rotation 1s linear infinite;
}

@keyframes button-rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #ff9a9a;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.extra-links {
  margin-top: 2rem;
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
  margin-top: 0.75rem;
}
</style>