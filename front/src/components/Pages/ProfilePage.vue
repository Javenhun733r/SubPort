<template>
  <div class="container">
    <h2>Мій профіль</h2>

    <form @submit.prevent="updateProfile">
      <!-- Ім'я -->
      <div class="form-group">
        <label>Ім'я</label>
        <input type="text" v-model="user.name" required>
      </div>

      <!-- Пошта (тільки для перегляду) -->
      <div class="form-group">
        <label>Пошта</label>
        <input type="email" :value="user.email" disabled />
      </div>

      <!-- Нікнейм (тільки для перегляду) -->
      <div class="form-group">
        <label>Нікнейм</label>
        <input type="text" :value="user.username" disabled />
      </div>

      <!-- Біографія -->
      <div class="form-group">
        <label>Біографія</label>
        <textarea v-model="user.bio" required></textarea>
      </div>

      <!-- Жанр -->
      <div class="form-group">
        <label>Жанр</label>
        <select v-model="user.genre" required>
          <option disabled value="">Оберіть жанр</option>
          <option>Геймінг</option>
          <option>Музика</option>
          <option>Освіта</option>
          <option>Гумор</option>
          <option>Блоги</option>
          <option>Арт</option>
        </select>
      </div>

      <button type="submit">Зберегти зміни</button>
    </form>

    <h3>Ваші соцмережі</h3>
    <div v-if="user.socials && user.socials.length > 0">
      <ul>
        <li v-for="(social, index) in user.socials" :key="index">
          <strong>{{ social.name }}:</strong> <a :href="social.link">{{ social.link }}</a>
        </li>
      </ul>
    </div>
    <button @click="addSocial">Додати соцмережу</button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: {
        name: "",
        email: "",
        username: "",
        bio: "",
        genre: "",
        socials: [],
      },
    };
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        const response = await axios.get("http://localhost:8081/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
        this.user = response.data;
      } catch (error) {
        console.error("Помилка при завантаженні профілю", error);
      }
    },
    async updateProfile() {
      try {
        const response = await axios.put(
            "http://localhost:8081/profile",
            this.user,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
        );
        alert("Профіль оновлено");
      } catch (error) {
        console.error("Помилка при оновленні профілю", error);
      }
    },
    addSocial() {
      this.user.socials.push({ name: "", link: "" });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 100px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input, textarea, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
