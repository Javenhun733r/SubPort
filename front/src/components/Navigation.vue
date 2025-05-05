<template>
  <nav class="navbar">
    <div class="logo">
      <router-link to="/" class="text-logo">SubPort</router-link>
    </div>
    <ul class="nav-links">
      <li v-if="isAdmin"><router-link to="/requests_page">Управління заявками</router-link></li>
      <li v-if="isAuth"><router-link to="/add-author">Додати свою сторінку</router-link></li>
      <li v-if="isAuth"><router-link to="/main">Головна</router-link></li>
      <li v-if="isAuth"><router-link to="/chat">Чати</router-link></li>
      <li v-if="isAuth"><router-link to="/profile">Профіль</router-link></li>
      <li v-if="isAuth" @click="logout">Вийти</li>
      <li v-if="!isAuth"><router-link to="/login">Увійти</router-link></li>
      <li v-if="!isAuth"><router-link to="/signup">Зареєструватися</router-link></li>
    </ul>
  </nav>
</template>

<script>
import axios from "axios";

export default {
  name: "Nav-bar",
  data() {
    return {
      isAuth: false,
      isAdmin: false,
      jwt: "",
    };
  },
  async mounted() {
    const jwt = localStorage.getItem("jwt");
    this.isAuth = jwt !== null;
    this.jwt = jwt;

    if (this.isAuth) {
      try {
        const res = await axios.get('http://localhost:8081/profile', {
          headers: { Authorization: `Bearer ${this.jwt}` },
        });

        // Now you can safely access the 'user' object in the response
        this.isAdmin = res.data.user.role === 'ADMIN';
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }
  },
  methods: {
    logout() {
      this.isAuth = false;
      this.isAdmin = false;
      localStorage.removeItem("jwt");
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: #333;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.logo {
  font-size: 1.5rem;
}

.text-logo {
  text-decoration: none;
  color: #fff;
}

.nav-links {
  list-style: none;
  display: flex;
}

.logo a:hover {
  color: #7eb9ff;
}

.nav-links li {
  margin-right: 20px;
}

.nav-links li a {
  color: #fff;
  text-decoration: none;
}

.nav-links li a:hover {
  text-decoration: underline;
}
</style>
