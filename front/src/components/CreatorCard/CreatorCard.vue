<template>
  <router-link :to="`/author/${creator.username}`" class="creator-card-link group">
    <div class="creator-card-content">
      <div class="creator-card-header">
        <img
            :src="creator.avatarUrl || '/default-avatar.png'"
            :alt="`Аватар ${creator.username}`"
            class="avatar-image"
        />
      </div>

      <h3 class="creator-name">@{{ creator.username }}</h3>
      <p class="creator-real-name" v-if="creator.name && creator.name !== creator.username">{{ creator.name }}</p>
      <p class="creator-genre">{{ creator.genre }}</p>

      <div v-if="creator.socials && creator.socials.length > 0" class="social-icons-container">
        <a
            v-for="social in creator.socials"
            :key="social.name"
            :href="social.link"
            target="_blank"
            rel="noopener noreferrer"
            class="social-icon-link"
            :title="social.name"
        >
          <i :class="getIconClass(social.name)"></i>
        </a>
      </div>
      <div v-else class="social-icons-placeholder"></div>

      <div class="button-container">
        <span class="cta-button-card-text">
          Переглянути профіль
          <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
  </router-link>
</template>

<script>
// JavaScript залишається таким самим
export default {
  props: {
    creator: {
      type: Object,
      required: true
    }
  },
  methods: {
    getIconClass(socialNameInput) {
      const socialName = String(socialNameInput).toLowerCase();
      const icons = {
        youtube: 'fab fa-youtube',
        telegram: 'fab fa-telegram-plane',
        instagram: 'fab fa-instagram',
        tiktok: 'fab fa-tiktok',
        facebook: 'fab fa-facebook-f',
        twitter: 'fab fa-twitter',
        linkedin: 'fab fa-linkedin-in',
        patreon: 'fab fa-patreon',
        website: 'fas fa-globe',
      };
      return icons[socialName] || 'fas fa-link';
    }
  }
}
</script>

<style scoped>
.creator-card-link {
  display: block;
  text-decoration: none;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  height: 100%; /* Для однакової висоти в гріді */
  background-color: rgba(35, 42, 66, 0.6); /* ОСНОВНИЙ ФОН КАРТКИ */
  border: 1px solid rgba(0, 247, 255, 0.12); /* Тонка ціанова рамка */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); /* М'яка тінь для глибини */
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out;
}

.creator-card-link:hover {
  transform: translateY(-5px); /* Легкий підйом */
  box-shadow: 0 10px 25px rgba(0, 247, 255, 0.15); /* Тінь з акцентом */
  border-color: rgba(0, 247, 255, 0.3);
}

.creator-card-content {
  padding: 1.5rem; /* Внутрішні відступи */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  /* backdrop-filter НЕ ПОТРІБЕН ТУТ, якщо фон на .creator-card-link */
}

/* Прибираємо .creator-card-bg-shine та @keyframes spinBorder */

.creator-card-header {
  margin-bottom: 1rem; /* Збільшено відступ для "повітря" */
  width: 100%;
  display: flex;
  justify-content: center;
}
.avatar-image {
  width: 72px; /* Золотий перетин, класичний розмір */
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #00a1a8; /* Приглушений ціан для рамки */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* Тонша тінь */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.group:hover .avatar-image {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 247, 255, 0.2); /* Тінь з акцентом при наведенні */
}

.creator-name {
  font-size: 1.15rem; /* Чіткий, але не кричущий */
  font-weight: 600; /* Semi-bold */
  color: #e0e0e0; /* Світло-сірий, а не яскравий акцент */
  margin-bottom: 0.2rem;
  transition: color 0.3s ease;
  word-break: break-word; /* Дозволяє переносити довгі нікнейми */
}
.group:hover .creator-name {
  color: #00f7ff; /* Акцентний колір при наведенні на картку */
}

.creator-real-name {
  font-size: 0.8rem;
  color: #90a0b0; /* Більш приглушений сірий */
  margin-bottom: 0.35rem;
  font-style: normal; /* Прибираємо курсив для більш строгого вигляду */
}

.creator-genre {
  font-size: 0.75rem; /* Компактний */
  color: #7a8c9e; /* Ще більш приглушений */
  margin-bottom: 1.25rem; /* Більше відступу перед іконками */
  line-height: 1.5;
  min-height: 2.25em; /* 0.75rem * 1.5 * 2 рядки */
}

.social-icons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem; /* Трохи менший відступ */
  margin-top: 0.25rem; /* Зменшено */
  margin-bottom: 1.25rem;
  min-height: 1.5rem; /* Зменшено */
}
.social-icons-placeholder { min-height: calc(1.5rem + 0.25rem + 1.25rem); }

.social-icon-link i {
  font-size: 1rem; /* Компактні іконки */
  color: #7f9eb2;
  transition: color 0.25s ease, transform 0.25s ease;
}
.social-icon-link:hover i {
  color: #00e0e8; /* Трохи світліший ціан */
  transform: translateY(-2px); /* Легкий підйом іконки */
}

.button-container {
  margin-top: auto;
  width: 100%;
  padding-top: 0.5rem; /* Зменшено */
}
.cta-button-card-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.6rem 0.85rem; /* Зменшено */
  background-color: rgba(0, 247, 255, 0.1); /* Напівпрозорий акцентний фон */
  color: #00f7ff; /* Акцентний текст */
  font-size: 0.8rem;
  font-weight: 500; /* Medium */
  text-decoration: none;
  border-radius: 6px;
  border: 1px solid rgba(0, 247, 255, 0.2); /* Тонка акцентна рамка */
  transition: all 0.3s ease;
}
.creator-card-link:hover .cta-button-card-text {
  background-color: rgba(0, 247, 255, 0.2);
  border-color: rgba(0, 247, 255, 0.4);
  color: #9effff;
  box-shadow: 0 2px 8px rgba(0, 247, 255, 0.1); /* Легка тінь при наведенні на картку */
  transform: none; /* Прибираємо transform з кнопки, оскільки картка вже анімується */
}
.button-icon { width: 0.8rem; height: 0.8rem; margin-left: 0.25rem; }
</style>