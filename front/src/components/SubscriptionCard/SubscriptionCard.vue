<template>
  <div class="bg-gradient-to-b from-indigo-700 to-purple-800 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-sm mx-auto">
    <h3 class="font-semibold text-lg mb-3 text-white">{{ title }}</h3>
    <p class="text-2xl font-bold mb-2 text-white">{{ price }} ₴<span class="text-sm text-indigo-300">/міс</span></p>
    <button @click="handleSubscription" class="w-full py-2 mb-4 bg-indigo-500 text-black rounded-full font-medium hover:bg-indigo-600 transition-all duration-200">
      Підписатися
    </button>
    <p class="text-sm text-gray-300 mb-2">{{ description }}</p>
  </div>
</template>

<script>
export default {
  props: ['title', 'price', 'description', 'isChat'],
  methods: {
    handleSubscription()
    {
      console.log('Користувач доданий до чату!');
      if (this.isChat) {
        this.$emit('addUserToChat');  // Викликаємо подію для додавання користувача до чату
      }
    }
  }
}


</script>

<style scoped>
/* Стилі для картки */
.bg-gradient-to-b {
  background-image: linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%);
}

.bg-gradient-to-b:hover {
  background-image: linear-gradient(180deg, rgba(59, 130, 246, 0.7) 0%, rgba(99, 102, 241, 0.7) 100%);
}

button {
  transition: transform 0.2s ease, background-color 0.3s ease;
}
button:hover {
  transform: scale(1.05);
}

.text-indigo-300 {
  color: #93c5fd;
}

.text-purple-200 {
  color: #d8b4fe;
}

.shadow-xl {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.shadow-2xl {
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
}

.text-white {
  color: #ffffff;
}

.text-gray-300 {
  color: #e2e8f0;
}

/* Стилі для обмеження ширини картки */
.w-full {
  width: 100%;
}

.max-w-sm {
  max-width: 300px; /* Обмеження ширини картки */
}

.mx-auto {
  margin-left: auto;
  margin-right: auto; /* Центрування картки */
}

/* Заокруглення картки */
.rounded-2xl {
  border-radius: 1rem; /* Заокруглені краї картки */
}

/* Стилі для кнопки */
button {
  padding: 0.6rem 1.2rem; /* Зменшене поле кнопки */
  border-radius: 50px; /* Заокруглені краї */
  font-size: 0.875rem; /* Менший розмір шрифта */
  text-align: center;
  color: black; /* Чорний текст на кнопці */
}

/* Медіа-запити */
@media (max-width: 768px) {
  /* Стилі для мобільних пристроїв */
  .max-w-sm {
    max-width: 100%; /* На мобільних ширина картки займає 100% */
  }
}
</style>
