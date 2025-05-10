<template>
  <div class="reset-password-page-wrapper">
    <div class="form-container">
      <div class="form-header">
        <svg class="header-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.628 5.855M15 7A7.488 7.488 0 0012 4.545V7M15 7h.01M9 12.25c0 .967.394 1.848.996 2.497M9 12.25c0-1.06.398-2.031 1-2.775M12 17.25c0 .414.162.787.432 1.064M12 17.25V14.25" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 14.25c-1.057 0-2.054.257-2.86.709M9 21a3 3 0 01-3-3V7.5a3 3 0 013-3h6a3 3 0 013 3v3.75M9 21a3 3 0 003 3h3M9 21v-2.25M15 18.75a3 3 0 003-3v-1.5M15 18.75a3 3 0 01-3 3M15 18.75v-2.25" />
        </svg>
        <h2 class="form-main-title">Встановлення нового пароля</h2>
        <p class="form-subtitle">Будь ласка, введіть ваш новий пароль та підтвердіть його.</p>
      </div>

      <form @submit.prevent="resetPassword" class="form-content">
        <div v-if="formMessage.text" :class="['form-message', formMessage.type === 'success' ? 'message-success' : 'message-error']" role="alert">
          <p v-if="formMessage.type === 'success'">✅ {{ formMessage.text }}</p>
          <p v-else>❌ {{ formMessage.text }}</p>
        </div>

        <div class="form-group" v-if="!success">
          <label for="password" class="form-label">Новий пароль</label>
          <div class="input-wrapper">
            <input
                id="password"
                v-model="password"
                :type="passwordFieldType"
                class="input-field"
                placeholder="Мінімум 8 символів"
                required
                @input="clearMessages"
            />
            <button type="button" @click="togglePasswordVisibility('password')" class="password-toggle-icon" :title="passwordFieldType === 'password' ? 'Показати пароль' : 'Приховати пароль'">
              <svg v-if="passwordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.022 7 9.542 7 1.126 0 2.207-.245 3.231-.666l-1.748-1.747zm-2.89 1.43A7.952 7.952 0 0010 18c-3.182 0-5.993-1.756-7.628-4.545L4.46 11.01A7.951 7.951 0 0010 14.545c.283 0 .56-.017.833-.05l1.737 1.736z" /></svg>
            </button>
          </div>
        </div>

        <div class="form-group" v-if="!success">
          <label for="confirm" class="form-label">Підтвердіть новий пароль</label>
          <div class="input-wrapper">
            <input
                id="confirm"
                v-model="confirm"
                :type="confirmPasswordFieldType"
                class="input-field"
                placeholder="Повторіть пароль"
                required
                @input="clearMessages"
            />
            <button type="button" @click="togglePasswordVisibility('confirm')" class="password-toggle-icon" :title="confirmPasswordFieldType === 'password' ? 'Показати пароль' : 'Приховати пароль'">
              <svg v-if="confirmPasswordFieldType === 'password'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.022 7 9.542 7 1.126 0 2.207-.245 3.231-.666l-1.748-1.747zm-2.89 1.43A7.952 7.952 0 0010 18c-3.182 0-5.993-1.756-7.628-4.545L4.46 11.01A7.951 7.951 0 0010 14.545c.283 0 .56-.017.833-.05l1.737 1.736z" /></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="cta-button" :disabled="loading || success">
          <span v-if="loading" class="button-loader"></span>
          <span v-else>Змінити пароль</span>
        </button>
      </form>
      <div v-if="success" class="extra-links">
        <router-link to="/login" class="extra-link highlight">Перейти до сторінки входу</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"; // onMounted тут не потрібен, якщо verifyEmail викликається з mounted в Options API
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirm = ref("");
const loading = ref(false);
// const error = ref(""); // Замінено на formMessage
// const success = ref(""); // Замінено на formMessage
const formMessage = ref({ type: '', text: '' }); // Для повідомлень

const passwordFieldType = ref("password");
const confirmPasswordFieldType = ref("password");

const clearMessages = () => {
  formMessage.value = { type: '', text: '' };
};

const togglePasswordVisibility = (field) => {
  if (field === 'password') {
    passwordFieldType.value = passwordFieldType.value === "password" ? "text" : "password";
  } else if (field === 'confirm') {
    confirmPasswordFieldType.value = confirmPasswordFieldType.value === "password" ? "text" : "password";
  }
};

const resetPassword = async () => {
  clearMessages();

  if (password.value !== confirm.value) {
    formMessage.value = { type: 'error', text: "Паролі не збігаються." };
    return;
  }
  if (password.value.length < 8) { // Приклад простої валідації
    formMessage.value = { type: 'error', text: "Пароль має містити щонайменше 8 символів." };
    return;
  }


  loading.value = true;

  try {
    const token = route.params.token;
    if (!token) {
      formMessage.value = { type: 'error', text: "Токен для скидання пароля відсутній або недійсний." };
      loading.value = false;
      return;
    }

    const res = await axios.post(
        `http://localhost:8081/reset-password/${token}`, // Переконайтесь, що URL правильний
        { password: password.value }
    );

    formMessage.value = { type: 'success', text: res.data.message || "Пароль успішно змінено!" };
    password.value = ""; // Очистити поля
    confirm.value = "";
    setTimeout(() => {
      if (formMessage.value.type === 'success') { // Перенаправлення тільки при успіху
        router.push("/login");
      }
    }, 3000); // Затримка для прочитання повідомлення

  } catch (err) {
    console.error("Помилка скидання пароля:", err.response || err.message || err);
    if (err.response && err.response.data && (err.response.data.message || err.response.data.error)) {
      formMessage.value = { type: 'error', text: err.response.data.message || err.response.data.error };
    } else if (err.response && err.response.status) {
      formMessage.value = { type: 'error', text: `Помилка ${err.response.status}. Не вдалося змінити пароль.` };
    }
    else {
      formMessage.value = { type: 'error', text: "Сталася невідома помилка. Спробуйте пізніше." };
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Припускаємо, що глобальний фон #121828 та шрифт "Raleway" встановлені */
.reset-password-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Raleway", sans-serif;
  color: #e0e0e0;
  /* background-color: #121828; */ /* Якщо не глобально */
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
  .form-container { padding: 1.5rem 1.25rem; }
}

.form-header { text-align: center; margin-bottom: 1.75rem; }
.header-icon {
  width: 3rem; height: 3rem; color: #00f7ff;
  margin: 0 auto 1rem auto; opacity: 0.8;
}
.form-main-title {
  font-size: 1.75rem; font-weight: 600;
  color: #00f7ff; margin-bottom: 0.5rem;
}
.form-subtitle { font-size: 0.9rem; color: #b0c4de; line-height: 1.5; }

.form-content { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; }
.form-label {
  display: block; color: #a0aec0;
  font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;
}

.input-wrapper { position: relative; } /* Для іконки видимості пароля */
.input-field {
  width: 100%; padding: 0.875rem 1rem;
  /* Для іконки справа, якщо вона є */
  padding-right: 2.75rem; /* Залишаємо місце для іконки */
  border-radius: 8px; background-color: rgba(10, 15, 35, 0.65);
  border: 1px solid rgba(0, 247, 255, 0.25); color: #e0e0e0;
  font-size: 1rem; transition: all 0.3s ease; box-sizing: border-box;
}
.input-field::placeholder { color: #6b7f99; }
.input-field:focus {
  outline: none; border-color: #00f7ff;
  background-color: rgba(10, 15, 35, 0.85);
  box-shadow: 0 0 0 3px rgba(0, 247, 255, 0.2);
}

.password-toggle-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0; /* колір іконки */
  cursor: pointer;
  padding: 0.25rem;
}
.password-toggle-icon:hover { color: #00f7ff; }
.password-toggle-icon svg { width: 1.25rem; height: 1.25rem; }


.cta-button {
  width: 100%; padding: 0.875rem 1rem;
  background: linear-gradient(90deg, #00f7ff, #3675f4); color: #121828;
  font-weight: 600; border-radius: 8px; transition: all 0.3s ease;
  border: none; cursor: pointer; font-size: 1.05rem;
  display: flex; align-items: center; justify-content: center;
  margin-top: 0.5rem;
}
.cta-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 220, 220, 0.25);
  background: linear-gradient(90deg, #23ffff, #538dff);
}
.cta-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

.button-loader { /* Спіннер */
  width: 20px; height: 20px; border: 2px solid #121828;
  border-bottom-color: transparent; border-radius: 50%;
  display: inline-block; box-sizing: border-box;
  animation: button-rotation 1s linear infinite;
}
@keyframes button-rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-message {
  padding: 0.85rem 1rem; border-radius: 8px;
  text-align: center; font-size: 0.9rem; font-weight: 500;
  line-height: 1.5;
  display: flex; /* Для іконки поруч з текстом */
  align-items: center;
  justify-content: center;
}
.form-message p { margin: 0; }
.message-success {
  color: #c1f0d9; background-color: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.25);
}
.message-error {
  color: #ffc5c5; background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.extra-links { margin-top: 1.75rem; text-align: center; }
.extra-link {
  color: #a0aec0; font-size: 0.875rem; text-decoration: none;
  transition: color 0.3s ease; display: inline-flex; align-items: center;
}
.extra-link:hover { color: #00f7ff; text-decoration: underline; }
.extra-link.highlight { color: #00f7ff; font-weight: 600; }
</style>