<template>

  <div v-if="loading">
    <p>Перевірка вашої електронної пошти...</p>
  </div>
  <div v-else>
    <p v-if="success">✅ Ваша електронна пошта успішно підтверджена!</p>
    <p v-else class="error">❌ {{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loading: true,
      success: false,
      error: '',
    };
  },
  methods: {
    async verifyEmail() {
      const token = this.$route.params.token;
      try {
        const response = await axios.get(`http://localhost:8081/verify-email/${token}`);
        if (response.status === 200 && response.data.message) {
          this.success = true;
        } else {
          this.error = "Не вдалося підтвердити електронну пошту. Спробуйте пізніше.";
        }
      } catch (err) {
        console.error(err);
        this.error = err.response?.data?.error || "Сталась помилка під час перевірки.";
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.verifyEmail();
  },
};
</script>

<style scoped>
div {
  text-align: center;
  margin-top: 50px;
}

p {
  font-size: 1.2em;
}

.error {
  color: red;
}
</style>
