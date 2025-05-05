<template>
  <div class="container">
    <h2>Реєстрація</h2>
    <form @submit.prevent="signup">

      <div class="form-group">
        <label>Пошта</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label>Логін</label>
        <input type="text" id="name" v-model="name" required>
      </div>
      <div class="form-group">
        <label>Пароль</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit" class="cta-button">Реєстрація</button>
    </form>

    <div v-if="showMessage" class="message">
      <p>Будь ласка, перевірте вашу електронну пошту, щоб підтвердити акаунт!</p>
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
      showMessage: false,  // Для відображення сповіщення
    };
  },
  methods: {
    async signup() {
      const userData = {
        name: this.name,
        email: this.email,
        password: this.password,
      };

      try {
        const response = await axios.post("http://localhost:8081/register", userData);
        const token = response.data.token;
        // Показуємо повідомлення, що потрібно перевірити пошту
        this.showMessage = true;
        if (token) {
          localStorage.setItem("jwt", token);
          console.log("JWT збережено:", token);



          // Перенаправлення через 5 секунд
          setTimeout(() => {
            window.location.href = '/items';
          }, 5000);
        } else {
          console.error("JWT не отримано після реєстрації");
        }
      } catch (error) {
        console.error("Signup failed: " + error);
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 100px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  max-width: 380px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 90%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

.message {
  margin-top: 20px;
  color: #28a745;
  font-weight: bold;
}
</style>
