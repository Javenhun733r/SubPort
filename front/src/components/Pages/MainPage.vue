<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-6">
    <!-- Header -->
    <h1 class="text-4xl font-bold text-center text-indigo-800 mb-6 shadow-md px-4 py-2 rounded-lg bg-white">Знайди свого крієтора</h1>

    <!-- Search + Filter -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
      <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук за ніком..."
          class="w-full md:w-1/2 px-6 py-3 rounded-full border border-indigo-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
      />
      <select
          v-model="selectedGenre"
          class="w-full md:w-1/4 px-6 py-3 rounded-full border border-indigo-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
      >
        <option value="">Усі жанри</option>
        <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
      </select>
    </div>

    <div class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <CreatorCard class="creator-card"
                   v-for="creator in filteredCreators"
                   :key="creator.username"
                   :creator="creator"
      />
    </div>
  </div>
</template>

<script>
import CreatorCard from '../CreatorCard/CreatorCard.vue'
import axios from 'axios';

export default {
  components: { CreatorCard },
  data() {
    return {
      searchQuery: '',
      selectedGenre: '',
      genres: ['Геймінг', 'Музика', 'Освіта', 'Гумор', 'Блоги', 'Арт'],
      creators: [],
    }
  },
  mounted() {
    this.fetchCreators();
  },
  methods: {
    async fetchCreators() {
      try {
        const response = await axios.get('http://localhost:8081/authors'); // Шлях до вашого API
        this.creators = response.data; // Отримуємо всіх авторів
      } catch (error) {
        console.error("Error fetching creators:", error);
      }
    }
  },
  computed: {
    filteredCreators() {
      return this.creators.filter(c =>
          c.username.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.selectedGenre === '' || c.genre === this.selectedGenre)
      )
    }
  },
}
</script>

<style scoped>
/* Стилі для форми пошуку та фільтру */
input, select, textarea {
  font-size: 1rem;
  border-radius: 9999px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 0 2px 6px rgba(66, 153, 225, 0.6);
  border-color: #4c51bf;
}

input {
  padding-left: 1.5rem;
}

select {
  padding-left: 1.5rem;
}

textarea {
  padding-left: 1.5rem;
  padding-top: 1rem;
}

/* Стилі для заголовка */
h1 {
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  padding: 1rem 2rem;
}

/* Сітка для карток */
.grid {
  display: grid;
  gap: 2rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.md\:grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.lg\:grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.creator-card {
  margin-top: 10px;
  transition: all 0.3s ease;
  border-radius: 20px;
  padding: 1.5rem;
  background: linear-gradient(145deg, rgba(234, 231, 255, 1), rgba(240, 247, 255, 1));
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}



.creator-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Стили для кнопки "Перейти на сторінку" */
button {
  background-color: #4c51bf;
  color: white;
  padding: 0.8rem 1.6rem;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s ease;
}

button:hover {
  background-color: #434190;
  transform: scale(1.05);
}
</style>
