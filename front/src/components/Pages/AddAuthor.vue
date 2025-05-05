<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-200 p-8 flex flex-col items-center">
    <h1 class="text-4xl font-bold text-indigo-900 mb-10 shadow-xl px-8 py-4 rounded-full bg-white border-4 border-indigo-600">Додати нову сторінку автора</h1>

    <div class="w-full max-w-2xl bg-white p-10 rounded-3xl shadow-2xl space-y-8">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Username -->
        <div>
          <label for="username" class="block text-indigo-800 font-semibold text-lg">Нікнейм</label>
          <input
              v-model="newAuthor.username"
              type="text"
              id="username"
              placeholder="@nickname"
              class="input-field"
              required
          />
        </div>

        <!-- Name -->
        <div>
          <label for="name" class="block text-indigo-800 font-semibold text-lg">Ім’я</label>
          <input
              v-model="newAuthor.name"
              type="text"
              id="name"
              placeholder="Ім’я автора"
              class="input-field"
              required
          />
        </div>
        <!-- Genre -->
        <div>
          <label for="genre" class="block text-indigo-800 font-semibold text-lg">Жанр</label>
          <select
              v-model="newAuthor.genre"
              id="genre"
              class="input-field"
              required
          >
            <option disabled value="">Оберіть жанр</option>
            <option v-for="(genre, idx) in genres" :key="idx" :value="genre">
              {{ genre }}
            </option>
          </select>
        </div>

        <!-- Avatar -->
        <div>
          <label for="avatarFile" class="block text-indigo-800 font-semibold text-lg">Аватар</label>
          <input
              @change="handleAvatarUpload"
              type="file"
              id="avatarFile"
              accept="image/*"
              class="input-field"
          />
        </div>

        <!-- Socials -->
        <div>
          <label class="block text-indigo-800 font-semibold text-lg mb-2">Соцмережі</label>
          <div class="space-y-4">
            <div
                v-for="(social, index) in selectedSocials"
                :key="index"
                class="flex gap-2 items-center"
            >
              <select
                  v-model="social.name"
                  class="flex-1 input-field"
              >
                <option disabled value="">Виберіть платформу</option>
                <option v-for="(option, idx) in socialNetworks" :key="idx" :value="option">
                  {{ option }}
                </option>
              </select>
              <input
                  v-model="social.link"
                  type="url"
                  placeholder="https://"
                  class="flex-1 input-field"
              />
              <button
                  type="button"
                  @click="removeSocial(index)"
                  class="text-red-500 hover:text-red-700 text-lg"
                  title="Видалити"
              >
                ✕
              </button>
            </div>
          </div>
          <button
              @click="addSocial"
              type="button"
              class="mt-4 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            ➕ Додати соцмережу
          </button>
        </div>

        <!-- Bio -->
        <div>
          <label for="bio" class="block text-indigo-800 font-semibold text-lg">Опис</label>
          <textarea
              v-model="newAuthor.bio"
              id="bio"
              rows="4"
              placeholder="Коротка біографія автора..."
              class="input-field"
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="text-center">
          <button
              type="submit"
              class="px-6 py-3 rounded-full bg-indigo-600 text-white text-lg font-semibold shadow-lg hover:bg-indigo-700 transition transform hover:scale-105"
          >
            ✅ Додати автора
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      newAuthor: {
        username: '',
        name: '',
        avatarUrl: '',
        bio: '',
        genre: '',
        socials: []
      },
      avatarFile: null,
      selectedSocials: [{ name: '', link: '' }],
      socialNetworks: ['Instagram', 'Facebook', 'Twitter', 'YouTube', 'LinkedIn'],
      genres: ['Геймінг', 'Музика', 'Освіта', 'Гумор', 'Блоги', 'Арт'],
    };
  },
  methods: {
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append("username", this.newAuthor.username);
        formData.append("name", this.newAuthor.name);
        formData.append("bio", this.newAuthor.bio);
        formData.append("genre", this.newAuthor.genre);

        // Фільтруємо лише заповнені соцмережі
        const filteredSocials = this.selectedSocials.filter(social => social.name && social.link);
        formData.append("socials", JSON.stringify(filteredSocials));

        if (this.avatarFile) {
          formData.append("avatarFile", this.avatarFile);
        }
        console.log(localStorage.getItem('jwt'));
        await axios.post('http://localhost:8081/request', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`
          }
        });
        alert("Заявка успішно надіслана!");
        this.newAuthor = { username: '', name: '', avatarUrl: '', bio: '', socials: [] };
        this.selectedSocials = [{ name: '', link: '' }];
      } catch (err) {
        console.error("Помилка при надсиланні заявки:", err);
        alert("Не вдалося надіслати заявку.");
      }
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.avatarFile = file;
      } else {
        this.avatarFile = null;
      }
    },
    addSocial() {
      this.selectedSocials.push({ name: '', link: '' });
    },
    removeSocial(index) {
      this.selectedSocials.splice(index, 1);
    }
  }
}
</script>


<style scoped>
/* Загальний стиль для королівського вигляду */
body {
  font-family: 'Merriweather', serif;
}

h1 {
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  padding: 1.5rem 3rem;
  border: 4px solid #4c51bf;
  font-family: 'Georgia', serif;
  color: #2c3e50;
}

/* Стійкі стилі для форми */
input, textarea, select {
  font-size: 1rem;
  border-radius: 12px;
  background-color: #f3f4f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 4px 10px rgba(66, 153, 225, 0.6);
}
.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  transition: 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.input-field:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
  outline: none;
}
/* Стиль для кнопки */
button {
  background-color: #4c51bf;
  color: white;
  font-weight: 600;
  padding: 0.8rem 2rem;
  border-radius: 40px;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #434190;
  transform: scale(1.05);
}

/* Стиль для контейнера */
div {
  max-width: 80%;
  margin: 0 auto;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border: 1px solid #4c51bf;
}
</style>
