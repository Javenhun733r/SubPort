<template>
  <div class="add-author-page-wrapper">
    <div class="form-container">
      <div class="form-header">
        <h1 class="form-main-title">Створення сторінки автора</h1>
        <p class="form-subtitle">Поділіться своєю творчістю зі спільнотою SubPort!</p>
      </div>

      <form @submit.prevent="submitForm" class="form-content">
        <div v-if="formMessage.text"
             :class="['form-message', formMessage.type === 'success' ? 'message-success' : 'message-error']"
             role="alert">
          {{ formMessage.text }}
        </div>

        <div class="form-group">
          <label for="username" class="form-label">Нікнейм <span class="required-star">*</span></label>
          <div class="input-prefix-wrapper">
            <span class="input-prefix-text">@</span>
            <input v-model="newAuthor.username" type="text" id="username" placeholder="унікальний_нікнейм"
                   class="input-field with-prefix" required @input="clearMessage"/>
          </div>
        </div>

        <div class="form-group">
          <label for="name" class="form-label">Ім’я автора <span class="required-star">*</span></label>
          <input v-model="newAuthor.name" type="text" id="name" placeholder="Як вас представляти" class="input-field"
                 required @input="clearMessage"/>
        </div>

        <div class="form-group">
          <label for="genre" class="form-label">Основний жанр <span class="required-star">*</span></label>
          <div class="select-wrapper">
            <select v-model="newAuthor.genre" id="genre" class="input-field" required @change="clearMessage">
              <option disabled value="">Оберіть ваш напрямок творчості</option>
              <option v-for="genreItem in genres" :key="genreItem" :value="genreItem">{{ genreItem }}</option>
            </select>

          </div>
        </div>

        <div class="form-group">
          <label for="avatarFile" class="form-label">Аватар (до 2MB)</label>
          <div class="file-input-custom-wrapper">
            <input @change="handleAvatarUpload" type="file" id="avatarFile" accept="image/*" class="file-input-hidden"/>
            <label for="avatarFile" class="file-input-button">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20"
                   fill="currentColor">
                <path
                    d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13H5.5z"/>
                <path d="M9 13h2v5a1 1 0 11-2 0v-5z"/>
              </svg>
              <span>{{ avatarFile ? 'Змінити файл' : 'Обрати файл' }}</span>
            </label>
            <span v-if="avatarFile" class="file-name-display">{{ avatarFile.name }}</span>
          </div>
          <p v-if="avatarFile && avatarFile.size > 2 * 1024 * 1024" class="text-xs text-red-400 mt-1">Файл завеликий.
            Макс. розмір 2MB.</p>
        </div>

        <fieldset class="form-group socials-fieldset">
          <legend class="form-label legend-label">Соцмережі (опціонально)</legend>
          <div class="socials-container">
            <div v-for="(social, index) in newAuthor.socials" :key="index" class="social-input-group">
              <div class="select-wrapper social-select-wrapper">
                <select v-model="social.name" class="input-field social-select" aria-label="Платформа соцмережі">
                  <option disabled value="">Платформа</option>
                  <option v-for="option in socialNetworks" :key="option" :value="option">{{ option }}</option>
                </select>
              </div>
              <input v-model="social.link" type="url" placeholder="https://..." class="input-field social-link-input"
                     aria-label="Посилання"/>
              <button type="button" @click="removeSocial(index)" class="button-remove-social" title="Видалити соцмережу"
                      aria-label="Видалити соцмережу">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          <button @click="addSocial" type="button" class="button-add-social">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Додати ще
          </button>
        </fieldset>

        <div class="form-group">
          <label for="bio" class="form-label">Короткий опис / Біографія</label>
          <textarea v-model="newAuthor.bio" id="bio" rows="5"
                    placeholder="Чим ви займаєтесь, ваші інтереси, чим можете бути корисні..."
                    class="input-field"></textarea>
        </div>

        <div class="submit-button-container">
          <button type="submit" class="cta-button" :disabled="isLoading">
            <span v-if="isLoading" class="button-loader"></span>
            <span v-else>Надіслати заявку</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddAuthorPage',
  data() {
    return {
      newAuthor: {
        username: '',
        name: '',
        bio: '',
        genre: '',
        socials: []
      },
      avatarFile: null,

      socialNetworks: ['Instagram', 'Facebook', 'Twitter / X', 'YouTube', 'TikTok', 'LinkedIn', 'GitHub', 'Twitch', 'Website'],
      genres: ['Ігри (Стріми/Огляди)', 'Музика (Виконавець/Гурт)', 'Освіта (Лекції/Курси)', 'Подкасти', 'Література (Письменник/Поет)', 'Мистецтво (Художник/Фотограф)', 'Технології (Огляди/Розробка)', 'Лайфстайл (Блоги/Влоги)', 'Гумор (Стендап/Скетчі)', 'Кулінарія', 'Подорожі', 'Спорт', 'Бізнес/Фінанси', 'Наука', 'Інше'],
      isLoading: false,
      formMessage: {type: '', text: ''},
    };
  },
  methods: {
    clearMessage() {
      this.formMessage = {type: '', text: ''};
    },
    handleAvatarUpload(event) {
      this.clearMessage();
      const file = event.target.files[0];
      const avatarInput = document.getElementById('avatarFile');

      if (file && file.type.startsWith('image/')) {
        if (file.size > 2 * 1024 * 1024) {
          this.formMessage = {type: 'error', text: 'Файл занадто великий. Максимальний розмір аватара - 2MB.'};
          this.avatarFile = null;
          if (avatarInput) avatarInput.value = '';
          return;
        }
        this.avatarFile = file;
      } else {
        if (file) {
          this.formMessage = {type: 'error', text: 'Будь ласка, оберіть файл зображення (PNG, JPG, GIF).'};
        }
        this.avatarFile = null;
        if (avatarInput) avatarInput.value = '';
      }
    },
    addSocial() {
      this.clearMessage();
      if (this.newAuthor.socials.length < 5) {
        this.newAuthor.socials.push({name: '', link: ''});
      } else {
        this.formMessage = {type: 'error', text: 'Можна додати максимум 5 соцмереж.'};
      }
    },
    removeSocial(index) {
      this.clearMessage();
      this.newAuthor.socials.splice(index, 1);
      if (this.newAuthor.socials.length === 0) {
        this.newAuthor.socials.push({name: '', link: ''});
      }
    },
    async submitForm() {
      this.isLoading = true;
      this.clearMessage();

      if (!this.newAuthor.username || !this.newAuthor.name || !this.newAuthor.genre) {
        this.formMessage = {type: 'error', text: 'Будь ласка, заповніть усі обов\'язкові поля, позначені *.'};
        this.isLoading = false;
        return;
      }

      try {
        const formData = new FormData();
        formData.append("username", this.newAuthor.username);
        formData.append("name", this.newAuthor.name);
        formData.append("bio", this.newAuthor.bio || "");
        formData.append("genre", this.newAuthor.genre);

        const filteredSocials = this.newAuthor.socials.filter(social => social.name && social.link && social.link.match(/^https?:\/\/.+/));
        if (filteredSocials.length > 0) {
          formData.append("socials", JSON.stringify(filteredSocials));
        }

        if (this.avatarFile) {
          formData.append("avatarFile", this.avatarFile);
        }

        const token = localStorage.getItem('jwt');
        if (!token) {
          this.formMessage = {type: 'error', text: 'Помилка авторизації. Будь ласка, увійдіть до системи.'};
          this.isLoading = false;

          return;
        }

        await axios.post('http://localhost:8081/request', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        this.formMessage = {type: 'success', text: "Заявка успішно надіслана! Очікуйте на розгляд."};
        this.newAuthor = {username: '', name: '', bio: '', genre: '', socials: [{name: '', link: ''}]};
        this.avatarFile = null;
        const avatarInput = document.getElementById('avatarFile');
        if (avatarInput) avatarInput.value = '';

      } catch (err) {
        console.error("Помилка при надсиланні заявки:", err.response || err);
        if (err.response && err.response.data && err.response.data.message) {
          this.formMessage = {type: 'error', text: `Помилка: ${err.response.data.message}`};
        } else if (err.response) {
          this.formMessage = {
            type: 'error',
            text: `Не вдалося надіслати заявку (код: ${err.response.status}). Перевірте введені дані.`
          };
        } else if (err.request) {
          this.formMessage = {type: 'error', text: 'Сервер не відповідає. Перевірте ваше інтернет-з\'єднання.'};
        } else {
          this.formMessage = {type: 'error', text: 'Не вдалося надіслати заявку. Спробуйте ще раз.'};
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
  mounted() {
    if (!this.newAuthor.socials || this.newAuthor.socials.length === 0) {
      this.newAuthor.socials = [{name: '', link: ''}];
    }
  }
}
</script>

<style scoped>

.add-author-page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  max-width: 700px;
  width: 100%;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-main-title {
  font-size: 2rem;
  font-weight: 600;
  color: #00f7ff;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 1rem;
  color: #a0aec0;
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

.legend-label {
  padding: 0 0.5rem;
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #00f7ff;
  font-weight: 500;
}

.required-star {
  color: #ff7b7b;
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

.input-prefix-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix-text {
  position: absolute;
  left: 1rem;
  color: #718096;
  pointer-events: none;
}

.input-field.with-prefix {
  padding-left: 2.25rem;
}

.file-input-custom-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-input-hidden {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.file-input-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: rgba(0, 247, 255, 0.1);
  color: #00f7ff;
  border: 1px solid rgba(0, 247, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.file-input-button:hover {
  background-color: rgba(0, 247, 255, 0.2);
  border-color: rgba(0, 247, 255, 0.5);
}

.file-name-display {
  font-size: 0.875rem;
  color: #a0aec0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.socials-fieldset {
  border: 1px solid rgba(0, 247, 255, 0.2);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.75rem;
}

.socials-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.social-select-wrapper {
  flex: 1 1 40%;
}

.social-select {
  padding-right: 2.25rem;
}

.social-link-input {
  flex: 1 1 60%;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.select-arrow-container {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(0, 247, 255, 0.7);
}

.select-arrow-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.small-arrow {
  width: 0.9rem;
  height: 0.9rem;
}

.button-remove-social {
  padding: 0.6rem;
  color: #ff7b7b;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.3s ease, background-color 0.3s ease;
}

.button-remove-social:hover {
  color: #ff5252;
  background-color: rgba(255, 0, 0, 0.1);
}

.button-add-social {
  margin-top: 1rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  background-color: transparent;
  color: #00f7ff;
  border: 1px dashed rgba(0, 247, 255, 0.5);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.button-add-social:hover {
  background-color: rgba(0, 247, 255, 0.1);
  border-style: solid;
  border-color: rgba(0, 247, 255, 0.7);
}

.submit-button-container {
  text-align: center;
  margin-top: 1.5rem;
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
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.message-success {
  color: #c1f0d9;
  background-color: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.25);
}

.message-error {
  color: #ffc5c5;
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.2);
}
</style>