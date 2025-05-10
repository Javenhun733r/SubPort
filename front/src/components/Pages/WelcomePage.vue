<template>
  <div class="hero-container">
    <div class="hero-content">
      <h1 class="hero-title">Відкрийте світ української творчості!</h1>
      <p class="hero-subtitle">Підтримуйте талановитих креаторів, надихайтесь унікальним контентом та станьте частиною нашої дружньої спільноти.</p>
      <router-link to="/signup" class="cta-button">Долучитися зараз!</router-link>
    </div>
  </div>
</template>

<script setup>
// Поки що скрипти не потрібні для цього дизайну
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  80% { /* Додаємо opacity: 1 сюди для плавності */
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1; /* Явно встановлюємо opacity: 1 в кінці анімації */
    transform: scale(1);
  }
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
  padding: 40px 20px;
  /* background: linear-gradient(135deg, #1a2f4b 0%, #345077 50%, #007bff 100%); */ /* ФОН ПРИБРАНО */
  text-align: center;
  color: #333333; /* ЗМІНЕНО КОЛІР ТЕКСТУ НА ТЕМНИЙ для світлого фону */
  overflow: hidden;
}

.hero-content {
  max-width: 700px;
  animation: fadeIn 1s ease-out forwards;
}

.hero-title {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 20px;
  /* text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); */ /* Тінь тексту менш потрібна на світлому фоні, можна прибрати або змінити */
  color: #2c3e50; /* Більш конкретний темний колір для заголовка */
  animation: fadeIn 0.8s ease-out 0.2s forwards;
  opacity: 0; /* Початковий стан для анімації */
}

.hero-subtitle {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1.3rem;
  line-height: 1.7;
  margin-bottom: 35px;
  color: #555555; /* ЗМІНЕНО КОЛІР ТЕКСТУ НА ТЕМНО-СІРИЙ */
  animation: fadeIn 0.8s ease-out 0.5s forwards;
  opacity: 0;
}

.cta-button {
  display: inline-block;
  padding: 18px 40px;
  background-color: #FFD700; /* Жовтий колір кнопки добре виглядатиме на світлому фоні */
  color: #1a2f4b; /* Темний текст для контрасту з жовтою кнопкою */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  border-radius: 50px;
  transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Тінь кнопки трохи змінена для світлого фону */
  opacity: 0; /* Початковий стан для анімації popIn */
  animation: popIn 0.7s ease-out 0.8s forwards; /* Затримка 0.8s */
}

.cta-button:hover,
.cta-button:focus {
  background-color: #ffe44d;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

/* Адаптивність для менших екранів */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.8rem;
  }
  .hero-subtitle {
    font-size: 1.1rem;
  }
  .cta-button {
    padding: 15px 30px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-container {
    min-height: 80vh;
    padding: 20px 15px;
  }
  .hero-title {
    font-size: 2.2rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>