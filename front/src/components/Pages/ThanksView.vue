<template>
  <div class="thank-you-page-wrapper">
    <div class="thank-you-card" role="alert" aria-live="assertive">
      <div class="icon-container">
        <svg class="thank-you-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M7 8h10M7 12h4m6 0h-2m-4 4h4m5-4h-2.599A1.998 1.998 0 0015 10c0-1.105-1.343-2-3-2m0 0V7"/>
        </svg>
      </div>
      <h1 class="thank-you-title">Дякуємо за підтримку, <span class="author-name">{{ authorNameToDisplay }}</span>!</h1>
      <p class="thank-you-subtitle">Ваш внесок дуже важливий для розвитку творчості.</p>
      <button @click="goToAuthor" class="cta-button">
        Повернутись на сторінку автора
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();

const authorNameToDisplay = computed(() => route.query.author || 'креатора');
const authorUsername = computed(() => route.query.author || '');

const goToAuthor = () => {
  if (authorUsername.value) {
    router.push(`/author/${encodeURIComponent(authorUsername.value)}`);
  } else {

    router.push('/main');
    console.warn("authorUsername не знайдено в query параметрах для повернення на сторінку автора.");
  }
};
</script>

<style scoped>

@keyframes fadeInScaleUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.thank-you-page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: "Raleway", sans-serif;

  color: #e0e0e0;
}

.thank-you-card {
  background-color: rgba(30, 35, 58, 0.8);
  backdrop-filter: blur(10px) saturate(150%);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  border: 1px solid rgba(0, 247, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: fadeInScaleUp 0.6s ease-out forwards;
}

@media (min-width: 640px) {
  .thank-you-card {
    padding: 3rem 3.5rem;
  }
}

.icon-container {
  margin-bottom: 1.5rem;
}

.thank-you-icon {
  width: 5rem;
  height: 5rem;
  color: #00f7ff;

  filter: drop-shadow(0 0 10px rgba(0, 247, 255, 0.5));
}

.thank-you-title {
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.3;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

@media (min-width: 640px) {
  .thank-you-title {
    font-size: 2.25rem;
  }
}

.author-name {
  color: #00f7ff;
  font-weight: 700;
}

.thank-you-subtitle {
  font-size: 1.05rem;
  color: #bdc6d3;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.875rem 2.25rem;
  background: linear-gradient(90deg, #00f7ff, #3675f4);
  color: #121828;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 220, 220, 0.15);
}

.cta-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 220, 220, 0.3);
  background: linear-gradient(90deg, #23ffff, #538dff);
}
</style>