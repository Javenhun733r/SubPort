<template>
  <div class="min-h-screen bg-gradient-to-b from-indigo-800 to-purple-900 bg-cover bg-no-repeat relative px-4 py-6 text-black">
    <!-- Космічний фон -->
    <div class="absolute top-0 left-0 w-full h-full bg-cover bg-no-repeat z-0" style="background-image: url('https://images.unsplash.com/photo-1486677844461-c5d70d97c96e'); opacity: 0.4;"></div>

    <!-- Profile Section -->
    <section class="text-center mb-8 relative z-10">
      <div class="avatar-container w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
        <img
            src='../image/profile.jpg'
            class="w-full h-full object-cover"
            alt="Avatar"
        />
      </div>
      <h2 class="text-3xl font-bold text-black">Leb1ga</h2>
      <p class="text-sm text-gray-600">528 підписників</p>
      <p class="text-gray-700">Михайло</p>
      <div class="flex justify-center gap-6 mt-4">
        <!-- Іконки FontAwesome -->
        <font-awesome-icon icon="fa-brands fa-youtube" class="social-icon color hover:text-red-500" />
        <font-awesome-icon icon="fa-brands fa-twitch" class="social-icon hover:text-purple-600" />
        <font-awesome-icon icon="fa-brands fa-tiktok" class="social-icon hover:text-black" />
        <font-awesome-icon icon="fa-brands fa-instagram" class="social-icon hover:text-pink-500" />
      </div>
    </section>

    <!-- Tabs (Кнопки) -->
    <div class="flex justify-center space-x-6 mb-8 relative z-10">
      <button class="px-6 py-2 rounded-full bg-indigo-600 text-black font-semibold hover:bg-indigo-700 transition-all">Разовий донат</button>
      <button class="px-6 py-2 rounded-full bg-indigo-700 text-black font-semibold hover:bg-indigo-800 transition-all">Підписка</button>
      <button class="px-6 py-2 rounded-full bg-indigo-600 text-black font-semibold hover:bg-indigo-700 transition-all">Дописи</button>
    </div>

    <!-- Subscription Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
      <SubscriptionCard
          v-for="tier in tiers"
          :key="tier.title"
          :title="tier.title"
          :price="tier.price"
          :description="tier.description"
      />
    </section>
  </div>
</template>

<script>
import SubscriptionCard from '../SubscriptionCard/SubscriptionCard.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  components: { SubscriptionCard, FontAwesomeIcon },
  data() {
    return {
      tiers: [
        {
          title: 'Бидло Початківець',
          price: 199,
          description: 'Отримуєте скіни і романтики від Leb1ga.',
        },
        {
          title: 'Бидло Брат',
          price: 500,
          description: 'Скін + доступ до закритого каналу, поради і більше.',
        },
        {
          title: 'Бидло Бізнесмен',
          price: 1000,
          description: 'Скін + закритий канал + додаткові подарунки.',
        },
        {
          title: 'Бидло Багатій',
          price: 3000,
          description: 'Скін + канал + ще більше подарунків.',
        },
        {
          title: 'Бидло Магнат',
          price: 5000,
          description: 'Всі плюшки + вічна любов Leb1ga.',
        },
        {
          title: 'МЕГА БИДЛО',
          price: 10000,
          description: 'All-inclusive підписка від Leb1ga.',
        },
      ]
    }
  }
}
</script>

<style scoped>
/* Стилі для іконок */
.social-icon {
  font-size: 2rem; /* Збільшуємо розмір іконок */
  color: black; /* Базовий колір іконок */
  transition: transform 0.3s ease, color 0.3s ease; /* Плавна анімація для кольору та трансформації */
  padding-bottom: 20px;
}

.social-icon:hover {
  transform: scale(1.2); /* Збільшуємо іконку при наведенні */
}

/* Стилі для сітки */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}

.sm\:grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.md\:grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.lg\:grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Стиль для кнопок */
button {
  transition: background-color 0.3s ease, transform 0.3s ease;
}
button:hover {
  transform: scale(1.05);
}

/* Стилі для профілю */
.text-indigo-100 {
  color: #e0e7ff;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

/* Тіні */
.shadow-2xl {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* Медіа-запити */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 640px) {
  .sm\:grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Стилі для тексту над картками */
h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000000; /* Чорний текст */
  text-align: center; /* Центрування заголовка */
}

button {
  font-weight: 600;
  padding: 0.8rem 2rem;
  border-radius: 50px;
}

.subscription-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.subscription-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* Центрування аватарки та іншого тексту */
section.text-center {
  display: flex;
  flex-direction: column;
  align-items: center;  /* Центрування елементів по горизонталі */
  justify-content: center; /* Центрування елементів по вертикалі */
}

section.text-center h2,
section.text-center p {
  text-align: center; /* Встановлюємо центроване вирівнювання для всіх текстів */
}

/* Центрування кнопок */
div.flex {
  display: flex;
  justify-content: center;  /* Центрування кнопок */
  gap: 16px; /* Відстань між кнопками */
}

/* Стиль для контейнера аватарки */
.avatar-container {
  width: 4rem;  /* Встановлюємо ширину */
  height: 4rem; /* Встановлюємо висоту */
  overflow: hidden; /* Обрізаємо все, що виходить за межі */
}

.avatar-container img {
  width: 100%; /* Зображення займає всю ширину контейнера */
  height: 100%; /* Зображення займає всю висоту контейнера */
  object-fit: cover; /* Обрізаємо зображення, щоб воно заповнювало контейнер */
}
</style>
