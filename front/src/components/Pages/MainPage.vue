<template>
  <div class="find-authors-page">
    <div class="page-header">
      <h1 class="main-title"><span>Знайди</span> Свого Автора</h1>
      <p class="page-subtitle">Відкрийте нові таланти та підтримайте українську творчу спільноту</p>
    </div>

    <div class="controls-wrapper">
      <div class="search-input-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Пошук за ніком, іменем, жанром..."
            class="search-input-field"
        />
      </div>
      <div class="select-input-wrapper">
        <select v-model="selectedGenre" class="filter-select-field">
          <option value="">Усі жанри</option>
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
        <svg class="select-arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <div v-if="isLoading" class="feedback-section loading-state"> <p>Завантаження авторів...</p> </div>
    <div v-if="error" class="feedback-section error-state"> <p>{{ error }}</p> </div>
    <div v-if="!isLoading && !error && filteredCreators.length === 0" class="feedback-section empty-state">
      <p>На жаль, авторів за вашим запитом не знайдено.</p>
      <p class="text-sm mt-2 opacity-70">Спробуйте змінити пошуковий запит або фільтр жанрів.</p>
    </div>


    <div class="creators-grid-container">
      <CreatorCard
          v-for="(creator, index) in filteredCreators"
          :key="creator.username"
          :creator="creator"
          :style="{ '--animation-delay': (index * 0.05) + 's' }"
          class="animated-creator-card"
      />
    </div>
  </div>
</template>

<script>
// Ваш JavaScript код залишається практично без змін
// Додайте isLoading та error в data() та логіку їх оновлення в fetchCreators
import CreatorCard from '../CreatorCard/CreatorCard.vue' // Перевірте шлях!
import axios from 'axios';

export default {
  components: { CreatorCard },
  data() {
    return {
      searchQuery: '',
      selectedGenre: '',
      genres: ['Ігри (Стріми/Огляди)', 'Музика (Виконавець/Гурт)', 'Освіта (Лекції/Курси)', 'Подкасти', 'Література (Письменник/Поет)', 'Мистецтво (Художник/Фотограф)', 'Технології (Огляди/Розробка)', 'Лайфстайл (Блоги/Влоги)', 'Гумор (Стендап/Скетчі)', 'Кулінарія', 'Подорожі', 'Спорт', 'Бізнес/Фінанси', 'Наука', 'Інше'],
      creators: [],
      isLoading: true,
      error: null,
    }
  },
  mounted() {
    this.fetchCreators();
  },
  methods: {
    async fetchCreators() {
      this.isLoading = true;
      this.error = null;
      try {
        // await new Promise(resolve => setTimeout(resolve, 1500)); // Для тестування завантаження
        const response = await axios.get('http://localhost:8081/authors');
        this.creators = response.data;
      } catch (error) {
        console.error("Error fetching creators:", error);
        this.error = "Виникла помилка при завантаженні авторів. Будь ласка, спробуйте пізніше.";
      } finally {
        this.isLoading = false;
      }
    }
  },
  computed: {
    filteredCreators() {
      if (!this.creators) return [];
      return this.creators.filter(c =>
          (c.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
              (c.name && c.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
          ) &&
          (this.selectedGenre === '' || c.genre === this.selectedGenre)
      )
    }
  },
}
</script>

<style scoped>
@keyframes backgroundPan {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes subtleShine {
  0%, 100% { box-shadow: 0 0 5px rgba(0, 247, 255, 0.1), 0 0 10px rgba(0, 247, 255, 0.1); }
  50% { box-shadow: 0 0 15px rgba(0, 247, 255, 0.3), 0 0 25px rgba(0, 247, 255, 0.2); }
}
@keyframes cardAppear {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.find-authors-page {
  min-height: 100vh;
  padding: 2rem 1.5rem; /* Зменшено падінги для більшого екрану */
  font-family: "Raleway", sans-serif;
  color: #e0e0e0;
  background-size: 400% 400%; /* Для анімації фону */
  animation: backgroundPan 30s ease infinite;
  overflow-x: hidden; /* Щоб уникнути горизонтальної прокрутки через анімації */
}
@media (min-width: 768px) {
  .find-authors-page { padding: 3rem 2.5rem; }
}

.page-header {
  text-align: center;
  margin-bottom: 3rem; /* Збільшено відступ */
  animation: cardAppear 0.6s ease-out;
}
.main-title {
  font-size: 2.5rem;
  font-weight: 800; /* Extra-bold */
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 247, 255, 0.5), 0 0 20px rgba(0, 247, 255, 0.3);
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}
.main-title span {
  color: #3e8385; /* Акцент на слові "Знайди" */
}
@media (min-width: 768px) {
  .main-title { font-size: 3.5rem; }
}
.page-subtitle {
  font-size: 1.1rem;
  color: #b0c4de; /* Світлий синьо-сірий */
  max-width: 600px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .page-subtitle { font-size: 1.25rem; }
}


.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 3rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  padding: 1.5rem;
  background-color: rgba(15, 23, 42, 0.5); /* Темно-синій напівпрозорий */
  backdrop-filter: blur(8px) saturate(120%);
  border-radius: 16px; /* Більш заокруглені */
  border: 1px solid rgba(0, 247, 255, 0.15);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  animation: cardAppear 0.7s ease-out 0.1s backwards; /* з затримкою */
}
@media (min-width: 768px) {
  .controls-wrapper {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
    padding: 1.75rem 2rem;
  }
}

.search-input-wrapper, .select-input-wrapper {
  position: relative;
  width: 100%;
}
@media (min-width: 768px) {
  .search-input-wrapper { flex-grow: 2; } /* Пошук займає більше місця */
  .select-input-wrapper { flex-grow: 1; max-width: 280px; }
}

.search-input-field, .filter-select-field {
  width: 100%;
  padding: 0.85rem 1.25rem; /* Збільшено падінги */
  border-radius: 10px; /* Менш заокруглені, більш "техно" */
  background-color: rgba(10, 18, 39, 0.8); /* Дуже темний, майже непрозорий */
  border: 1px solid rgba(0, 247, 255, 0.3); /* Яскравіша рамка */
  color: #e0e0e0;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.search-input-field { padding-left: 3rem; /* Місце для іконки */ }
.filter-select-field { appearance: none; -webkit-appearance: none; -moz-appearance: none; padding-right: 3rem; }

.search-input-field::placeholder { color: #6b7f99; }
.search-input-field:focus, .filter-select-field:focus {
  outline: none;
  border-color: #00f7ff;
  background-color: rgba(10, 18, 39, 1); /* Непрозорий при фокусі */
  box-shadow: 0 0 0 3px rgba(0, 247, 255, 0.25), 0 0 15px rgba(0,247,255,0.2); /* Ефект світіння */
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem; height: 1.25rem;
  color: rgba(0, 247, 255, 0.6);
  pointer-events: none;
}
.select-arrow-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem; height: 1.25rem;
  color: rgba(0, 247, 255, 0.6);
  pointer-events: none;
}


.creators-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem; /* Збільшено відступ між картками */
}
.animated-creator-card {
  opacity: 0; /* Початковий стан для анімації */
  animation: cardAppear 0.5s ease-out forwards;
  animation-delay: var(--animation-delay, 0s); /* Для каскадної появи */
}

.feedback-section {
  padding: 3rem 1.5rem; text-align: center; border-radius: 12px;
  margin: 2rem auto; max-width: 600px;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 247, 255, 0.1);
  animation: cardAppear 0.5s ease-out;
}
.feedback-section p { font-size: 1.1rem; color: #bdc6d3; }
.feedback-section p.text-sm { font-size: 0.9rem; }
.loading-state { /* Специфічні стилі для завантаження, якщо потрібні */ }
.error-state p { color: #ff8a8a; } /* Червонуватий для помилки */

</style>