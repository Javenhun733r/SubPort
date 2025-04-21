<template>
  <div
      class="min-h-screen bg-gradient-to-b from-indigo-800 to-purple-900 bg-cover bg-no-repeat relative px-4 py-6 text-black">


    <!-- Profile Section -->
    <section class="text-center mb-8 relative z-10">
      <img :src="profile.avatar" class="..." />
      <h2>{{ profile.name }}</h2>
      <p>{{ profile.followers }} підписників</p>
      <p>{{ profile.fullName }}</p>
      <p>{{ profile.bio }}</p>

      <div class="flex justify-center gap-6 mt-4">
        <!-- Іконки FontAwesome для соцмереж -->
        <a v-for="(social, index) in profile.socials" :key="index" :href="social.link" target="_blank" class="social-icon">
          <font-awesome-icon :icon="`fa-brands fa-${social.name}`" />
        </a>
      </div>
    </section>

    <!-- Tabs (Кнопки) -->
    <div class="flex justify-center space-x-6 mb-8 relative z-10">
      <button @click="showDonations"
              class="px-6 py-2 rounded-full bg-indigo-600 text-black font-semibold hover:bg-indigo-700 transition-all">
        Разовий донат
      </button>
      <button @click="showSubscriptions"
              class="px-6 py-2 rounded-full bg-indigo-700 text-black font-semibold hover:bg-indigo-800 transition-all">
        Підписка
      </button>
      <button @click="showPosts"
              class="px-6 py-2 rounded-full bg-indigo-600 text-black font-semibold hover:bg-indigo-700 transition-all">
        Дописи
      </button>
    </div>

    <!-- Donation Form -->
    <div v-if="isDonationsVisible" class="donation-form bg-white p-6 rounded-lg shadow-lg relative z-10">
      <h3 class="text-xl font-semibold mb-4 text-indigo-700">Підтримати разовим донатом</h3>
      <div class="flex gap-4 mb-6">
        <button @click="donationAmount = 100" class="donation-btn">100₴</button>
        <button @click="donationAmount = 500" class="donation-btn">500₴</button>
        <button @click="donationAmount = 1000" class="donation-btn">1000₴</button>
        <button @click="donationAmount = 2000" class="donation-btn">2000₴</button>
      </div>

      <div class="mb-4">
        <label for="donationAmountInput" class="block text-sm text-gray-700">Введіть суму донату:</label>
        <input
            id="donationAmountInput"
            v-model="donationAmount"
            type="number"
            class="mt-2 p-2 w-full rounded-md border border-gray-300"
            placeholder="Введіть суму"
            min="1"
        />
      </div>

      <button @click="handleDonation"
              class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full w-full mt-4 hover:bg-indigo-700">
        Задонатити
      </button>
    </div>

    <!-- Subscription Cards -->
    <section v-if="isSubscriptionsVisible"
             class=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
      <SubscriptionCard class="subscription-card"
                        v-for="tier in tiers"
                        :key="tier.title"
                        :title="tier.title"
                        :price="tier.price"
                        :description="tier.description"
      />
    </section>

    <!-- User Posts Section -->
    <section v-if="isPostsVisible" class="mt-8">
      <div v-for="(post, index) in posts" :key="index" class="post-card mb-6 p-6 rounded-xl shadow-lg bg-white">
        <h3 class="text-2xl font-semibold text-indigo-700">{{ post.title }}</h3>
        <p class="mt-4 text-gray-800">{{ post.content }}</p>
      </div>
    </section>
  </div>
</template>

<script>
import SubscriptionCard from '../SubscriptionCard/SubscriptionCard.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import axios from 'axios';

export default {
  components: {SubscriptionCard, FontAwesomeIcon},

  props: ['username'],
  data() {
    return {
      profile: null, // Інформація автора
      tiers: [],
      posts: [],
      isSubscriptionsVisible: true,
      isPostsVisible: false,
      isDonationsVisible: false,
      donationAmount: null,
    }
  },

  created() {
    this.loadAuthorData()
  },
  methods: {
    async loadAuthorData() {
      try {
        const response = await axios.get(`http://localhost:8081/author/${this.username}`);
        const author = response.data;

        if (author) {
          this.profile = {
            name: author.name,
            avatar: author.avatarUrl,
            followers: author.subscribers || 0,
            fullName: author.name || 'Невідомий автор',
            bio: author.bio || '',
            socials: author.socials ? JSON.parse(author.socials).map(social => ({
              name: social.name.toLowerCase(),

              link: social.link
            })) : []

          };
          console.log(this.profile.socials);
          this.tiers = author.tiers || [];
          this.posts = author.posts || [];
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        this.profile = {
          name: 'Невідомий автор',
          avatar: '',
          followers: 0,
          fullName: 'Невідомий автор',
        };
        this.tiers = [];
        this.posts = [];
      }
    },

    showDonations() {
      this.isSubscriptionsVisible = false;
      this.isPostsVisible = false;
      this.isDonationsVisible = true;
    },
    showSubscriptions() {
      this.isSubscriptionsVisible = true;
      this.isPostsVisible = false;
      this.isDonationsVisible = false;
    },
    showPosts() {
      this.isSubscriptionsVisible = false;
      this.isPostsVisible = true;
      this.isDonationsVisible = false;
    },
    handleDonation() {
      if (this.donationAmount > 0) {
        alert(`Дякуємо за ваш донат у розмірі ${this.donationAmount}₴!`);
        this.donationAmount = null;  // Очищаємо поле після донату
      } else {
        alert('Будь ласка, введіть коректну суму для донату.');
      }
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
  align-items: center; /* Центрування елементів по горизонталі */
  justify-content: center; /* Центрування елементів по вертикалі */
}

section.text-center h2,
section.text-center p {
  text-align: center; /* Встановлюємо центроване вирівнювання для всіх текстів */
}

/* Центрування кнопок */
div.flex {
  display: flex;
  justify-content: center; /* Центрування кнопок */
  gap: 16px; /* Відстань між кнопками */
}

/* Стиль для контейнера аватарки */
.avatar-container {
  width: 4rem; /* Встановлюємо ширину */
  height: 4rem; /* Встановлюємо висоту */
  overflow: hidden; /* Обрізаємо все, що виходить за межі */
}

.avatar-container img {
  width: 100%; /* Зображення займає всю ширину контейнера */
  height: 100%; /* Зображення займає всю висоту контейнера */
  object-fit: cover; /* Обрізаємо зображення, щоб воно заповнювало контейнер */
}

/* Стиль для секції з дописами */
section.mt-8 {
  display: flex;
  flex-direction: column; /* Окремі елементи по вертикалі */
  align-items: center; /* Центруємо картки по горизонталі */
  justify-content: center; /* Центруємо картки по вертикалі */
  gap: 16px; /* Відстань між картками */
}

/* Стиль для карток дописів */
.post-card {
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 20px;
  width: 80%; /* Встановлюємо ширину картки */
  max-width: 600px; /* Максимальна ширина картки */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.post-card h3 {
  color: #4a4a4a;
  font-size: 1.5rem;
}

.post-card p {
  color: #5a5a5a;
  line-height: 1.6;
}

.donation-btn {
  background-color: #4c51bf;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
}

.donation-btn:hover {
  background-color: #434190;
}

/* Стиль для форми донату */
.donation-form {

  max-width: 400px;
  margin: 0 auto;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.donation-form input {
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-top: 10px;
}

/* Стилі для відступів між формами */
.donation-form,
.subscription-card,
.post-card {
  margin-top: 20px; /* Встановлюємо однаковий відступ між формами */
}
.social-icon {
  font-size: 2rem; /* Збільшуємо розмір іконок */
  color: black; /* Базовий колір іконок */
  transition: transform 0.3s ease, color 0.3s ease; /* Плавна анімація для кольору та трансформації */
  padding-bottom: 20px;
}

.social-icon:hover {
  transform: scale(1.2); /* Збільшуємо іконку при наведенні */
}
</style>
