<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6 flex items-center justify-center">
    <!-- Header -->
    <h1 class="text-4xl font-bold text-center text-indigo-900 mb-8 shadow-2xl px-6 py-4 rounded-lg bg-white border-4 border-indigo-600">Створити автора</h1>

    <!-- Form to add author -->
    <div class="max-w-lg w-full bg-white p-8 rounded-xl shadow-xl space-y-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Username -->
        <div class="mb-6">
          <label for="username" class="block text-gray-700 font-medium text-lg">Нікнейм:</label>
          <input v-model="newAuthor.username" type="text" id="username" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md" required />
        </div>

        <!-- Name -->
        <div class="mb-6">
          <label for="name" class="block text-gray-700 font-medium text-lg">Ім'я:</label>
          <input v-model="newAuthor.name" type="text" id="name" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md" required />
        </div>

        <!-- Avatar -->
        <div class="mb-6">
          <label for="avatarFile" class="block text-gray-700 font-medium text-lg">Аватар:</label>
          <input @change="handleAvatarUpload" type="file" id="avatarFile" accept="image/*" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md" />
        </div>

        <!-- Socials -->
        <div class="mb-6">
          <label class="block text-gray-700 font-medium text-lg">Соціальні мережі:</label>
          <div v-for="(social, index) in selectedSocials" :key="index" class="mb-4 space-y-4">
            <div class="flex flex-col space-y-4">
              <select v-model="social.name" class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md">
                <option disabled value="">Виберіть соцмережу</option>
                <option v-for="(option, idx) in socialNetworks" :key="idx" :value="option">{{ option }}</option>
              </select>
              <input v-model="social.link" type="url" placeholder="Введіть посилання" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md" />
              <button type="button" @click="removeSocial(index)" class="text-red-500 hover:text-red-700">X</button>
            </div>
          </div>
          <button @click="addSocial" type="button" class="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all">Додати соцмережу</button>
        </div>

        <!-- Bio -->
        <div class="mb-6">
          <label for="bio" class="block text-gray-700 font-medium text-lg">Біо:</label>
          <textarea v-model="newAuthor.bio" id="bio" class="w-full px-4 py-3 mt-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md" rows="4"></textarea>
        </div>

        <!-- Submit -->
        <div class="flex justify-center">
          <button type="submit" class="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all shadow-lg">Додати</button>
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
        socials: []
      },
      avatarFile: null,
      selectedSocials: [{ name: '', link: '' }],
      socialNetworks: ['Instagram', 'Facebook', 'Twitter', 'YouTube', 'LinkedIn']
    };
  },
  methods: {
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append("username", this.newAuthor.username);
        formData.append("name", this.newAuthor.name);
        formData.append("bio", this.newAuthor.bio);
        formData.append("userId", 2);

        // Фільтруємо лише заповнені соцмережі
        const filteredSocials = this.selectedSocials.filter(social => social.name && social.link);
        formData.append("socials", JSON.stringify(filteredSocials));

        if (this.avatarFile) {
          formData.append("avatarFile", this.avatarFile);
        }

        await axios.post('http://localhost:8081/request', formData);
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
