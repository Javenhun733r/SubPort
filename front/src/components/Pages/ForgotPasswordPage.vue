<template>
  <div class="forgot-password-page-wrapper">
    <div class="form-container">
      <div class="form-header">
        <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <h2 class="form-main-title">Забули пароль?</h2>
        <p class="form-subtitle">
          Без проблем! Введіть вашу електронну адресу, і ми надішлемо вам посилання для відновлення пароля.
        </p>
      </div>

      <form @submit.prevent="handlePasswordResetRequest" class="form-content">
        <div v-if="formMessage.text"
             :class="['form-message', formMessage.type === 'success' ? 'message-success' : 'message-error']"
             role="alert">
          {{ formMessage.text }}
        </div>

        <div class="form-group" v-if="!formMessage.type || formMessage.type === 'error'">
          <label for="email" class="form-label">Ваша електронна пошта</label>
          <input type="email" id="email" v-model="email" class="input-field" placeholder="example@email.com" required
                 @input="clearMessage">
        </div>

        <button type="submit" class="cta-button" :disabled="isLoading || formMessage.type === 'success'">
          <span v-if="isLoading" class="button-loader"></span>
          <span v-else>Надіслати інструкції</span>
        </button>
      </form>

      <div class="extra-links">
        <router-link to="/login" class="extra-link">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 inline-block" viewBox="0 0 20 20"
               fill="currentColor">
            <path fill-rule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clip-rule="evenodd"/>
          </svg>
          Повернутися до входу
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ForgotPasswordPage',
  data() {
    return {
      email: "",
      isLoading: false,
      formMessage: {type: '', text: ''},
    };
  },
  methods: {
    clearMessage() {
      this.formMessage = {type: '', text: ''};
    },
    async handlePasswordResetRequest() {
      this.isLoading = true;
      this.clearMessage();

      if (!this.email) {
        this.formMessage = {type: 'error', text: 'Будь ласка, введіть вашу електронну пошту.'};
        this.isLoading = false;
        return;
      }

      try {

        const response = await axios.post("http://localhost:8081/forgot-password", {email: this.email});

        this.formMessage = {
          type: 'success',
          text: response.data.message || 'Інструкції для відновлення пароля надіслано на вашу пошту!'
        };
        this.email = "";

      } catch (error) {
        console.error("Password reset request failed:", error.response || error.message || error);
        if (error.response && error.response.data && (error.response.data.message || error.response.data.error)) {
          this.formMessage = {type: 'error', text: error.response.data.message || error.response.data.error};
        } else if (error.request) {
          this.formMessage = {type: 'error', text: "Сервер не відповідає. Спробуйте пізніше."};
        } else {
          this.formMessage = {type: 'error', text: "Сталася невідома помилка."};
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>

.forgot-password-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Raleway", sans-serif;
  color: #e0e0e0;

}

.form-container {
  background-color: rgba(30, 35, 58, 0.75);
  backdrop-filter: blur(12px) saturate(160%);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  border: 1px solid rgba(0, 247, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  max-width: 450px;
  width: 100%;
  text-align: left;
}

@media (max-width: 640px) {
  .form-container {
    padding: 1.5rem 1.25rem;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  color: #00f7ff;
  margin: 0 auto 1rem auto;
  opacity: 0.8;
}

.form-main-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #00f7ff;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #b0c4de;
  line-height: 1.5;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
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
  background-color: rgba(10, 15, 35, 0.65);
  border: 1px solid rgba(0, 247, 255, 0.25);
  color: #e0e0e0;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-field::placeholder {
  color: #6b7f99;
}

.input-field:focus {
  outline: none;
  border-color: #00f7ff;
  background-color: rgba(10, 15, 35, 0.85);
  box-shadow: 0 0 0 3px rgba(0, 247, 255, 0.2);
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
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

.form-message {
  padding: 0.85rem 1rem;
  border-radius: 8px;

  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.5;
}

.extra-links {
  margin-top: 1.75rem;
  text-align: center;
}

.extra-link {
  color: #a0aec0;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
}

.extra-link:hover {
  color: #00f7ff;
  text-decoration: underline;
}
</style>