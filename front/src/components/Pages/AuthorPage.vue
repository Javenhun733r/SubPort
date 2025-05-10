<template>
  <div class="author-profile-page">
    <section v-if="profile" class="profile-hero-section">
      <div class="avatar-glow-container">
        <img :src="profile.avatar || '/default-avatar.png'" :alt="profile.name" class="profile-avatar"/>
      </div>
      <h1 class="profile-name">{{ profile.name }}</h1>
      <p v-if="profile.fullName && profile.fullName !== profile.name" class="profile-full-name">{{ profile.fullName }}</p>
      <p class="profile-followers">{{ profile.followers }} підписників</p>
      <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

      <div v-if="profile.socials && profile.socials.length" class="profile-socials">
        <a v-for="social in profile.socials" :key="social.name" :href="social.link" target="_blank" rel="noopener noreferrer" class="social-link" :title="social.name">
          <font-awesome-icon :icon="['fab', social.name.toLowerCase()]" />
        </a>
      </div>
    </section>
    <div v-else class="loading-placeholder">Завантаження профілю...</div>


    <div class="tabs-container">
      <button @click="showDonations()" :class="['tab-button', { 'active': isDonationsVisible }]">
        Разовий донат
      </button>
      <button @click="showSubscriptions()" :class="['tab-button', { 'active': isSubscriptionsVisible }]">
        Підписка
      </button>
      <button @click="showPosts()" :class="['tab-button', { 'active': isPostsVisible }]">
        Дописи
      </button>
    </div>

    <transition name="fade-content" mode="out-in">
      <div  class="content-area">
        <div v-if="isDonationsVisible" class="content-card donation-form-section">
          <h3 class="section-subtitle">Підтримати разовим донатом</h3>
          <div class="donation-presets">
            <button @click="donationAmount = 100" :class="['preset-amount-button', {'selected': donationAmount === 100}]">100₴</button>
            <button @click="donationAmount = 500" :class="['preset-amount-button', {'selected': donationAmount === 500}]">500₴</button>
            <button @click="donationAmount = 1000" :class="['preset-amount-button', {'selected': donationAmount === 1000}]">1000₴</button>
            <button @click="donationAmount = 2000" :class="['preset-amount-button', {'selected': donationAmount === 2000}]">2000₴</button>
          </div>
          <div class="form-group">
            <label for="donationAmountInput" class="form-label">Або введіть свою суму:</label>
            <input id="donationAmountInput" v-model.number="donationAmount" type="number" class="input-field" placeholder="Сума, ₴" min="1"/>
          </div>
          <button @click="handleDonation" class="cta-button main-action-button">
            Задонатити {{ donationAmount ? donationAmount + '₴' : '' }}
          </button>
        </div>

        <section v-if="isSubscriptionsVisible" class="content-card subscriptions-section">
          <h3 class="section-subtitle">Обрати рівень підписки</h3>
          <div class="subscriptions-grid">
            <SubscriptionCard
                v-for="tier in tiers"
                :key="tier.id" :id="tier.id"
                :title="tier.title"
                :price="tier.price"
                :description="tier.description"
                :isChat="tier.isChat"
                :username="profile.name"
                @addUserToChat="addUserToChat"
            />
            <div v-if="isOwner" class="add-new-card new-tier-form">
              <h4 class="text-lg font-semibold text-cyan-400 mb-3">Додати нову підписку</h4>
              <input v-model="newTier.title" placeholder="Назва рівня" class="input-field mb-2"/>
              <input v-model.number="newTier.price" type="number" placeholder="Ціна (₴)" class="input-field mb-2"/>
              <textarea v-model="newTier.description" placeholder="Опис переваг" class="input-field mb-3" rows="3"></textarea>
              <label class="flex items-center mb-4 text-sm text-gray-300">
                <input type="checkbox" v-model="newTier.isChat" class="form-checkbox mr-2">
                Додати підписників до приватного чату
              </label>
              <button @click="addTier" class="cta-button secondary-action-button">Додати рівень</button>
            </div>
          </div>
        </section>

        <section v-if="isPostsVisible" class="posts-section">
          <h3 class="section-subtitle text-center">Дописи автора</h3>
          <div v-if="isOwner" class="content-card new-post-form">
            <h4 class="text-lg font-semibold text-cyan-400 mb-3">Створити новий допис</h4>
            <input v-model="newPost.title" placeholder="Заголовок допису" class="input-field mb-2"/>
            <textarea v-model="newPost.content" placeholder="Що у вас нового?" class="input-field mb-3" rows="4"></textarea>
            <button @click="addPost" class="cta-button main-action-button">Опублікувати</button>
          </div>

          <div v-if="posts.length > 0" class="posts-list">
            <div v-for="post in posts" :key="post.id" class="post-item-card">
              <h4 class="post-title">{{ post.title }}</h4>
              <p class="post-content">{{ post.content }}</p>
              <p class="post-date">{{ post.createdAt}}</p>

              <div v-if="post.comments && post.comments.length" class="comments-section">
                <h5 class="text-sm font-semibold text-cyan-500 mb-1">Коментарі:</h5>
                <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                  <strong class="text-gray-300">{{ comment.author }}:</strong> {{ comment.text }}
                </div>
              </div>
              <div class="add-comment-form">
                <textarea v-model="newComment[post.id]" class="input-field comment-textarea" placeholder="Ваш коментар..."></textarea>
                <button @click="addComment(post.id)" class="cta-button secondary-action-button comment-button">Відправити</button>
              </div>
            </div>
          </div>
          <div v-else-if="!isOwner" class="content-card text-center py-8">
            <p class="text-gray-400">Автор ще не опублікував жодного допису.</p>
          </div>
        </section>
      </div>
    </transition>

    <section v-if="similarAuthors.length" class="similar-authors-section">
      <h2 class="section-subtitle text-center">Схожі автори</h2>
      <div class="creators-grid">
        <CreatorCard
            v-for="creator in similarAuthors"
            :key="creator.username"
            :creator="creator"
        />
      </div>
    </section>
  </div>
</template>


<script>
import SubscriptionCard from '../SubscriptionCard/SubscriptionCard.vue'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import axios from 'axios';
import backgroundImage from '../../assets/background.jpg';
import CreatorCard from "@/components/CreatorCard/CreatorCard.vue";
import {formatDate} from "@vueuse/shared";


export default {
  components: {CreatorCard, SubscriptionCard, FontAwesomeIcon},

  props: ['username'],
  data() {
    return {
      profile: null, // Інформація автора
      tiers: [],
      posts: [],
      similarAuthors: [],
      newComment: {},
      isOwner: false, // чи це сторінка поточного користувача
      newTier: {title: '', price: '', description: '', isChat: false},
      newPost: {title: '', content: ''},
      isSubscriptionsVisible: true,
      isPostsVisible: false,
      isDonationsVisible: false,
      donationAmount: null,
      backgroundStyle: {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      },
    }
  },

  created() {
    this.loadAuthorData()
    this.checkOwnership();

  },
  watch: {
    username(newUsername, oldUsername) {
      this.loadAuthorData();
      this.checkOwnership();
    }
  },
  methods: {
    async addComment(postId) {
      const commentText = this.newComment[postId];

      if (!commentText) {
        alert('Будь ласка, напишіть коментар!');
        return;
      }

      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(`http://localhost:8081/${postId}/comment`, {
          text: commentText,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const post = this.posts.find(p => p.id === postId);

        // Якщо немає comments (наприклад, новий пост) — ініціалізуємо
        if (!post.comments) {
          this.$set(post, 'comments', []);
        }

        // Додаємо новий коментар
        post.comments.push({
          id: response.data.id,
          text: response.data.text,
          author: response.data.user?.name || 'Анонім',
          createdAt: response.data.createdAt
        });

        this.newComment[postId] = '';
      } catch (e) {
        console.error('Не вдалося додати коментар:', e);
      }
    },


    async checkOwnership() {
      const token = localStorage.getItem('jwt');

      if (!token) {
        this.isOwner = false;
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8081/author/${this.username}/is-owner`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.isOwner = response.data.isOwner === true;
      } catch (error) {
        console.error('Помилка при перевірці власника:', error);
        this.isOwner = false;
      }
    },

    async loadAuthorData() {
      try {
        const response = await axios.get(`http://localhost:8081/author/${this.username}`);
        const author = response.data;

        if (author) {
          this.profile = {
            id: author.id,
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
          this.tiers = author.tiers || [];
          this.posts = (author.posts || []).map(p => ({
            ...p,
            comments: (p.Comment || []).map(c => ({
              id: c.id,
              text: c.text,
              author: c.user?.name || 'Анонім',
              createdAt: c.createdAt
            }))
          }));
          const genre = author.genre; // якщо є поле жанру
          if (genre) {
            try {
              const similarResponse = await axios.get(`http://localhost:8081/authors/${this.username}/similar`);
              // Фільтруємо поточного автора і беремо перші 3
              this.similarAuthors = similarResponse.data
                  .filter(a => a.username !== this.username)
                  .slice(0, 3);
            } catch (e) {
              console.error('Не вдалося завантажити схожих авторів:', e);
            }
          }

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
    async addTier() {
      if (!this.newTier.title || !this.newTier.price || !this.newTier.description) return;

      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(`http://localhost:8081/${this.profile.id}/tier`, {
          title: this.newTier.title,
          price: this.newTier.price,
          description: this.newTier.description,
          isChat: this.newTier.isChat  // передаємо isChat
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (this.newTier.isChat) {
          await this.addUserToChat(response.data.id);
        }

        this.tiers.push(response.data); // додаємо на фронті
        this.newTier = {title: '', price: '', description: '', isChat: false}; // очистити форму
      } catch (e) {
        console.error('Не вдалося додати тіру:', e);
      }
    },

    async addUserToChat() {
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(`http://localhost:8081/chats/${this.profile.id}/add-user`, {},
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
        );

        if (response.status === 200) {
          alert('Ви були додані до чату!');
        }
      } catch (error) {
        console.error('Не вдалося додати користувача до чату:', error);
      }
    },
    async addPost() {
      if (!this.newPost.title || !this.newPost.content) return;
      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(`http://localhost:8081/${this.profile.id}/post`, this.newPost, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });


        this.posts.unshift(response.data);
        this.newPost = {title: '', content: ''};
      } catch (e) {
        console.error('Не вдалося створити допис:', e);
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
    async handleDonation() {
      if (!this.donationAmount || this.donationAmount < 1) {
        alert("Введіть коректну суму");
        return;
      }

      try {
        const response = await axios.post("http://localhost:8081/api/create-donation", {
          amount: this.donationAmount,
          username: this.username
        });

        this.liqpayData = response.data.data;
        this.liqpaySignature = response.data.signature;

        // Створюємо HTML форму для Liqpay
        const form = document.createElement("form");
        form.action = "https://www.liqpay.ua/api/3/checkout"; // URL Liqpay для редиректу
        form.method = "POST";
        form.target = "_blank"; // Відкриває сторінку в новій вкладці

        // Додаємо дані для Liqpay в форму
        const dataInput = document.createElement("input");
        dataInput.type = "hidden";
        dataInput.name = "data";
        dataInput.value = this.liqpayData;

        const signatureInput = document.createElement("input");
        signatureInput.type = "hidden";
        signatureInput.name = "signature";
        signatureInput.value = this.liqpaySignature;

        form.appendChild(dataInput);
        form.appendChild(signatureInput);

        // Додаємо форму на сторінку та відправляємо
        document.body.appendChild(form);
        form.submit();
      } catch (err) {
        console.error("Помилка створення платежу:", err);
      }
    }


  }
}
</script>

<style scoped>
/* Припускаємо, що глобальний фон #121828 та шрифт "Raleway" встановлені */
.author-profile-page {
  /* background-color: #121828; -- Якщо не глобально, то тут */
  min-height: 100vh;
  color: #e0e0e0;
  font-family: "Raleway", sans-serif;
  padding: 1.5rem 1rem;
}
@media (min-width: 768px) {
  .author-profile-page { padding: 2.5rem; }
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Або інша висота */
  text-align: center;
  color: #a0aec0;
  font-size: 1.1rem;
}


.profile-hero-section {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem 1.5rem;
  background-color: rgba(35, 42, 66, 0.35); /* Трохи інший відтінок для "героя" */
  border-radius: 20px;
  border: 1px solid rgba(0, 247, 255, 0.12);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  animation: hero-fade-in 0.7s ease-out;
}
@keyframes hero-fade-in {
  from { opacity: 0; transform: translateY(-15px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatar-glow-container {
  position: relative; display: inline-block; margin-bottom: 1rem;
}
.profile-avatar {
  width: 110px; height: 110px; /* Зменшено */
  border-radius: 50%; object-fit: cover;
  border: 3px solid #00f7ff;
  box-shadow: 0 0 18px rgba(0, 247, 255, 0.25);
}
@media (min-width: 768px) { .profile-avatar { width: 130px; height: 130px; } }

.profile-name { font-size: 2rem; font-weight: 700; color: #ffffff; margin-bottom: 0.2rem; }
.profile-full-name { font-size: 0.95rem; color: #b0c4de; margin-bottom: 0.2rem; }
.profile-followers { font-size: 0.85rem; color: #8a9bb3; margin-bottom: 0.75rem; }
.profile-bio { font-size: 0.95rem; color: #c5d1e0; max-width: 550px; margin: 0 auto 1rem auto; line-height: 1.65; }
.profile-socials { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
.social-link { font-size: 1.35rem; color: #b0c4de; transition: color 0.3s ease, transform 0.3s ease; }
.social-link:hover { color: #00f7ff; transform: scale(1.1); }

/* Таби */
.tabs-container {
  display: flex; justify-content: center; gap: 0.5rem;
  margin-bottom: 2rem; position: relative; z-index: 10; flex-wrap: wrap;
}
@media (min-width: 640px) { .tabs-container { gap: 1.25rem; } }

.tab-button {
  padding: 0.6rem 1.2rem; /* Зменшено падінги */
  border-radius: 30px; font-weight: 500; font-size: 0.85rem; /* Зменшено шрифт */
  color: #b0c4de; background-color: rgba(30, 35, 58, 0.6);
  border: 1px solid rgba(0, 247, 255, 0.2);
  transition: all 0.25s ease; cursor: pointer;
}
.tab-button:hover { background-color: rgba(0, 247, 255, 0.1); color: #00f7ff; border-color: rgba(0, 247, 255, 0.35); }
.tab-button.active {
  background-color: #00f7ff; color: #121828; border-color: #00f7ff;
  box-shadow: 0 0 12px rgba(0, 247, 255, 0.25);
}
@media (min-width: 640px) { .tab-button { padding: 0.7rem 1.5rem; font-size: 0.95rem; } }

/* Контентна область */
.content-area { position: relative; }
.fade-content-enter-active, .fade-content-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-content-enter-from { opacity: 0; transform: translateY(10px); }
.fade-content-leave-to { opacity: 0; transform: translateY(-10px); }

.content-card, .new-post-form, .post-item-card {
  background-color: rgba(30, 35, 58, 0.5); /* Ще трохи прозоріше */
  backdrop-filter: blur(6px) saturate(120%); /* Менше блюру */
  border-radius: 12px; /* Менше заокруглення */
  padding: 1.25rem; /* Зменшено падінги */
  border: 1px solid rgba(0, 247, 255, 0.08); /* Тонша рамка */
  box-shadow: 0 3px 15px rgba(0,0,0,0.2);
  margin-bottom: 1.25rem;
}
@media (min-width: 768px) { .content-card, .new-post-form, .post-item-card { padding: 1.75rem; } }

.section-subtitle {
  font-size: 1.35rem; /* Зменшено */
  font-weight: 600; color: #e0e0e0;
  margin-bottom: 1.25rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 247, 255, 0.08);
}
.card-form-title { /* Для заголовків всередині форм додавання */
  font-size: 1.2rem; color: #00f7ff; margin-bottom: 1rem; text-align: center;
}


/* Форма донату */
.donation-form-section .section-subtitle { text-align: center; }
.donation-presets { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; margin-bottom: 1.25rem; }
.preset-amount-button {
  padding: 0.6rem 1rem; border-radius: 6px;
  background-color: rgba(0, 247, 255, 0.07); color: #00f7ff;
  border: 1px solid rgba(0, 247, 255, 0.15);
  font-weight: 500; font-size: 0.9rem;
  transition: all 0.2s ease; flex-grow: 1; min-width: 65px; text-align: center;
}
@media (min-width: 640px) { .preset-amount-button { flex-grow: 0; } }
.preset-amount-button:hover { background-color: rgba(0, 247, 255, 0.12); border-color: rgba(0, 247, 255, 0.3); }
.preset-amount-button.selected { background-color: #00f7ff; color: #121828; border-color: #00f7ff; box-shadow: 0 0 8px rgba(0, 247, 255, 0.25); }

/* Інпути (загальні для всіх форм на сторінці) */
.form-group { margin-bottom: 1rem; }
.form-label { display: block; font-size: 0.85rem; color: #b0c4de; margin-bottom: 0.25rem; }
.input-field {
  width: 100%; padding: 0.7rem 0.9rem; /* Зменшено падінги */
  border-radius: 6px; background-color: rgba(10, 15, 35, 0.75); /* Трохи менш прозорий */
  border: 1px solid rgba(0, 247, 255, 0.25); /* Яскравіша рамка */
  color: #e0e0e0; font-size: 0.95rem; /* Трохи менший шрифт */
  transition: all 0.2s ease; box-sizing: border-box;
}
.input-field::placeholder { color: #637690; }
.input-field:focus {
  outline: none; border-color: #00f7ff;
  background-color: rgba(10, 15, 35, 0.95); /* Майже непрозорий при фокусі */
  box-shadow: 0 0 0 2px rgba(0, 247, 255, 0.15);
}
.form-checkbox-label { display: flex; align-items: center; font-size: 0.9rem; color: #bdc6d3; cursor: pointer; }
.form-checkbox { /* Стилізація чекбоксу */
  appearance: none; background-color: rgba(10, 15, 35, 0.7);
  border: 1px solid rgba(0, 247, 255, 0.25); border-radius: 4px;
  width: 1.15em; height: 1.15em; cursor: pointer; position: relative; top: 0.1em; margin-right: 0.5rem;
}
.form-checkbox:checked {
  background-color: #00f7ff; border-color: #00f7ff;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='rgb(18,24,40)' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%; background-position: center; background-repeat: no-repeat;
}

/* Кнопки */
.cta-button {
  width: 100%; padding: 0.75rem 1rem; /* Зменшено падінги */
  background: linear-gradient(90deg, #00e8ef, #2e69e0); /* Менш насичений градієнт */
  color: #f0f0f0; /* Світлий текст */
  font-weight: 600; border-radius: 6px; transition: all 0.2s ease;
  border: none; cursor: pointer; font-size: 0.95rem;
  display: flex; align-items: center; justify-content: center;
}
.cta-button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 200, 200, 0.2); background: linear-gradient(90deg, #1cf0f8, #457bf0); }
.cta-button:disabled { opacity: 0.4; cursor: not-allowed; }

.main-action-button { margin-top: 0.5rem; }
.secondary-action-button {
  padding: 0.6rem 1.1rem; font-size: 0.85rem;
  background: rgba(0, 247, 255, 0.08); color: #00f7ff;
  border: 1px solid rgba(0, 247, 255, 0.25);
  width: auto; align-self: flex-end;
}
.secondary-action-button:hover:not(:disabled) { background: rgba(0, 247, 255, 0.15); border-color: rgba(0, 247, 255, 0.4); box-shadow: 0 1px 6px rgba(0, 247, 255, 0.1); }

/* Секція підписок */
.subscriptions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
.new-tier-form { border-style: dashed; border-color: rgba(0, 247, 255, 0.25); background-color: rgba(30, 35, 58, 0.3); padding: 1.5rem; }

/* Секція дописів */
.posts-section .section-subtitle { border-bottom: none; text-align: center; }
.posts-list { display: flex; flex-direction: column; gap: 1.25rem; align-items: center; }
.post-item-card { max-width: 650px; width: 100%; padding: 1.5rem; } /* Зменшено padding */
.post-title { font-size: 1.35rem; font-weight: 600; color: #00f7ff; margin-bottom: 0.6rem; }
.post-content { color: #c5d1e0; line-height: 1.65; margin-bottom: 0.6rem; white-space: pre-wrap; font-size: 0.95rem; }
.post-date { font-size: 0.75rem; color: #7789a0; text-align: right; margin-bottom: 1rem; }

.comments-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0, 247, 255, 0.08); }
.comments-title { font-size: 0.9rem; font-weight: 500; color: #c5d1e0; margin-bottom: 0.6rem; }
.comment-item { background-color: rgba(10, 15, 35, 0.6); padding: 0.6rem 0.85rem; border-radius: 4px; margin-bottom: 0.4rem; font-size: 0.8rem; }
.comment-author { color: #00f7ff; opacity: 0.8; }
.comment-text { color: #c5d1e0; }
.add-comment-form { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.comment-textarea { font-size: 0.85rem; padding: 0.6rem; }
.comment-button { margin-top: 0; padding: 0.5rem 1rem; font-size: 0.85rem; }

/* Схожі автори */
.similar-authors-section { margin-top: 2.5rem; padding: 0 0.5rem; }
.similar-authors-section .section-title-standalone { /* Новий клас для заголовка "Схожі автори" */
  font-size: 1.6rem; font-weight: 600; color: #e0e0e0; margin-bottom: 1.5rem; text-align: center;
}
.similar-authors-section .creators-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
</style>