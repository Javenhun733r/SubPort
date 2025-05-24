<template>
  <div class="author-profile-page">
    <section v-if="profile" class="profile-hero-section">
      <div class="avatar-glow-container">
        <img :src="profile.avatar || '/default-avatar.png'" :alt="profile.name" class="profile-avatar"/>
      </div>
      <h1 class="profile-name">{{ profile.name }}</h1>
      <p v-if="profile.fullName && profile.fullName !== profile.name" class="profile-full-name">{{
          profile.fullName
        }}</p>
      <p class="profile-followers">{{ profile.followers }} підписників</p>
      <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

      <div v-if="profile.socials && profile.socials.length" class="profile-socials">
        <a v-for="social in profile.socials" :key="social.name" :href="social.link" target="_blank"
           rel="noopener noreferrer" class="social-link" :title="social.name">
          <font-awesome-icon :icon="['fab', social.name.toLowerCase()]"/>
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
      <div class="content-area">
        <div v-if="isDonationsVisible" class="content-card donation-form-section">
          <h3 class="section-subtitle">Підтримати разовим донатом</h3>
          <div class="donation-presets">
            <button @click="donationAmount = 100"
                    :class="['preset-amount-button', {'selected': donationAmount === 100}]">100₴
            </button>
            <button @click="donationAmount = 500"
                    :class="['preset-amount-button', {'selected': donationAmount === 500}]">500₴
            </button>
            <button @click="donationAmount = 1000"
                    :class="['preset-amount-button', {'selected': donationAmount === 1000}]">1000₴
            </button>
            <button @click="donationAmount = 2000"
                    :class="['preset-amount-button', {'selected': donationAmount === 2000}]">2000₴
            </button>
          </div>
          <div class="form-group">
            <label for="donationAmountInput" class="form-label">Або введіть свою суму:</label>
            <input id="donationAmountInput" v-model.number="donationAmount" type="number" class="input-field"
                   placeholder="Сума, ₴" min="1"/>
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
                :username="profile.username"
                @addUserToChat="addUserToChat"
            />
            <div v-if="isOwner" class="add-new-card new-tier-form content-card"><h4
                class="card-form-title mb-6 text-xl">Створити новий рівень</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label for="newTierTitle" class="form-label">Назва рівня<span class="required-star">*</span></label>
                  <input id="newTierTitle" v-model.trim="newTier.title" placeholder="Наприклад, 'Срібний патрон'"
                         class="input-field w-full"/>
                  <p v-if="tierFormErrors.title" class="error-message">{{ tierFormErrors.title }}</p>
                </div>

                <div class="form-group">
                  <label for="newTierPrice" class="form-label">Ціна (₴/міс)<span class="required-star">*</span></label>
                  <input id="newTierPrice" v-model.number="newTier.price" type="number" placeholder="Наприклад, 50"
                         class="input-field w-full" min="1"/>
                  <p v-if="tierFormErrors.price" class="error-message">{{ tierFormErrors.price }}</p>
                </div>
              </div>

              <div class="form-group">
                <label for="newTierDescription" class="form-label">Опис переваг<span
                    class="required-star">*</span></label>
                <textarea id="newTierDescription" v-model.trim="newTier.description"
                          placeholder="Що отримає підписник? (кожен пункт з нового рядка для кращого відображення)"
                          class="input-field w-full min-h-[90px]" rows="4"></textarea>
                <p v-if="tierFormErrors.description" class="error-message">{{ tierFormErrors.description }}</p>
              </div>

              <div class="form-group checkbox-style-group">
                <input type="checkbox" id="newTierIsChat" v-model="newTier.isChat" class="visually-hidden-checkbox"/>
                <label for="newTierIsChat" class="form-checkbox-label custom-checkbox-label items-center">
                    <span class="custom-checkbox-box">
                        <font-awesome-icon v-if="newTier.isChat" :icon="['fas', 'check']" class="custom-checkbox-tick"/>
                    </span>
                  <span>Створити приватний чат для цього рівня</span>
                </label>
              </div>

              <button @click="submitNewTier" :disabled="!canSubmitNewTier || isSubmittingTier"
                      class="cta-button main-action-button w-full mt-4 py-3 text-base">
                <span v-if="isSubmittingTier">
                  <font-awesome-icon :icon="['fas', 'spinner']" spin class="mr-2"/> Додавання...
                </span>
                <span v-else>Додати рівень</span>
              </button>
            </div>
          </div>
        </section>

        <section v-if="isPostsVisible" class="posts-section">
          <h3 class="section-subtitle text-center">Дописи автора</h3>
          <div v-if="isOwner" class="content-card new-post-form">
            <h4 class="text-lg font-semibold text-cyan-400 mb-4">Створити новий допис</h4>

            <div class="form-group">
              <label for="newPostTitle" class="form-label">Заголовок<span class="text-red-500">*</span>:</label>
              <input id="newPostTitle" v-model.trim="newPost.title" placeholder="Наприклад, Мої враження від..."
                     class="input-field w-full"/>
              <p v-if="formErrors.title" class="error-message">{{ formErrors.title }}</p>
            </div>

            <div class="form-group">
              <label for="newPostContent" class="form-label">Зміст<span class="text-red-500">*</span>:</label>
              <textarea id="newPostContent" v-model.trim="newPost.content" placeholder="Поділіться своїми думками..."
                        class="input-field w-full min-h-[100px]" rows="5"></textarea>
              <p v-if="formErrors.content" class="error-message">{{ formErrors.content }}</p>
            </div>

            <div class="form-group">
              <label class="form-label">Зображення для допису (необов'язково):</label>
              <div class="file-input-container">
                <label for="postImageInput" class="file-input-label cta-button secondary-action-button mb-0">
                  <font-awesome-icon :icon="['fas', 'upload']" class="mr-2"/>
                  <span>{{ newPost.imageFile ? newPost.imageFile.name : 'Обрати файл' }}</span>
                </label>
                <input id="postImageInput" type="file" @change="handlePostImageUpload" accept="image/*"
                       class="file-input-hidden" ref="postImageInputRef"/>
              </div>
              <div v-if="newPost.imagePreviewUrl" class="image-preview-wrapper mt-3">
                <img :src="newPost.imagePreviewUrl" alt="Передперегляд" class="image-preview"/>
                <button @click="removePostImage" class="remove-image-button" title="Видалити зображення">
                  <font-awesome-icon :icon="['fas', 'times']"/>
                </button>
              </div>
            </div>

            <button @click="submitNewPost" :disabled="isSubmittingPost || !canSubmitPost"
                    class="cta-button main-action-button w-full mt-4">
              <span v-if="isSubmittingPost">
                <font-awesome-icon :icon="['fas', 'spinner']" spin class="mr-2"/> Публікація...
              </span>
              <span v-else>Опублікувати</span>
            </button>
          </div>

          <div v-if="posts.length > 0" class="posts-list">
            <div v-for="post in posts" :key="post.id" class="post-item-card">
              <button
                  v-if="isOwner"
                  @click="deletePost(post.id)"
                  class="delete-button post-delete-button"
                  title="Видалити допис">
                <font-awesome-icon :icon="['fas', 'trash']"/>
              </button>

              <h4 class="post-title">{{ post.title }}</h4>
              <img v-if="post.imageUrl" :src="post.imageUrl" alt="Зображення допису" class="post-image"/>
              <p class="post-content">{{ post.content }}</p>
              <p class="post-date">{{ formatDate(post.createdAt) }}</p>
              <div v-if="post.comments && post.comments.length" class="comments-section">
                <h5 class="text-sm font-semibold text-cyan-500 mb-1">Коментарі:</h5>
                <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                  <button
                      v-if="comment.userId === loggedInUserId || isOwner"
                      @click="deleteComment(comment.id, post.id)"
                      class="delete-button comment-delete-button"
                      title="Видалити коментар">
                    <font-awesome-icon :icon="['fas', 'times']"/>
                  </button>
                  <strong class="text-gray-300">{{ comment.author }}:</strong>
                  <img v-if="comment.imageUrl" :src="comment.imageUrl" alt="Зображення коментаря"
                       class="comment-image"/>
                  <p class="comment-text-display">{{ comment.text }}</p>
                </div>
              </div>
              <div class="add-comment-form">
                <textarea v-model="newComment[post.id]" class="input-field comment-textarea"
                          placeholder="Ваш коментар..."></textarea>
                <div class="form-group mt-2">
                  <label :for="'commentImageInput_' + post.id" class="form-label text-xs">Зображення
                    (необов'язково):</label>
                  <input type="file" @change="handleCommentImageUpload(post.id, $event)" accept="image/*"
                         class="input-field input-field-sm" :ref="'commentImageInput_' + post.id"/>
                  <img v-if="newCommentImage[post.id] && newCommentImagePreviewUrls[post.id]"
                       :src="newCommentImagePreviewUrls[post.id]" alt="Передперегляд коментаря"
                       class="image-preview mt-1"/>
                </div>
                <button @click="addComment(post.id)" class="cta-button secondary-action-button comment-button">
                  Відправити
                </button>
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


export default {
  components: {CreatorCard, SubscriptionCard, FontAwesomeIcon},

  props: ['username'],
  data() {
    return {
      profile: null,
      tiers: [],
      posts: [],
      similarAuthors: [],
      newComment: {},
      newCommentImage: {},
      newCommentImagePreviewUrls: {},
      isOwner: false,
      newTier: {title: '', price: null, description: '', isChat: false},
      newPost: {title: '', content: '', imageFile: null, imagePreviewUrl: null},
      tierFormErrors: {title: '', price: '', description: ''},
      isSubscriptionsVisible: true,
      isPostsVisible: false,
      isDonationsVisible: false,
      isSubmittingTier: false,
      donationAmount: null,
      loggedInUserId: null,
      isSubmittingPost: false,
      formErrors: {
        title: '',
        content: '',
      },
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
    this.getLoggedInUserId();

  },
  watch: {
    username(newUsername, oldUsername) {
      this.loadAuthorData();
      this.checkOwnership();
    }
  },
  computed: {
    canSubmitPost() {
      return this.newPost.title.trim() !== '' && this.newPost.content.trim() !== '';
    },
    canSubmitNewTier() {
      return (
          this.newTier.title.trim() !== '' &&
          this.newTier.price !== null &&
          typeof this.newTier.price === 'number' &&
          this.newTier.price >= 1 &&
          this.newTier.description.trim() !== '' &&
          !this.isSubmittingTier
      );
    }
  },
  methods: {
    validateNewTier() {
      let isValid = true;
      this.tierFormErrors = {title: '', price: '', description: ''};

      if (!this.newTier.title.trim()) {
        this.tierFormErrors.title = 'Назва рівня є обов\'язковим полем.';
        isValid = false;
      }
      if (this.newTier.price === null || typeof this.newTier.price !== 'number' || this.newTier.price < 1) {
        this.tierFormErrors.price = 'Вкажіть коректну ціну (число, більше або дорівнює 1).';
        isValid = false;
      }
      if (!this.newTier.description.trim()) {
        this.tierFormErrors.description = 'Опис переваг є обов\'язковим полем.';
        isValid = false;
      }
      return isValid;
    },
    getLoggedInUserId() {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.loggedInUserId = Number(payload.id);
          console.log('loggedInUserId set to:', this.loggedInUserId, typeof this.loggedInUserId);
        } catch (e) {
          console.error('Помилка декодування JWT:', e);
          this.loggedInUserId = null;
        }
      } else {
        this.loggedInUserId = null;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    handlePostImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newPost.imageFile = file;
        if (this.newPost.imagePreviewUrl) {
          URL.revokeObjectURL(this.newPost.imagePreviewUrl);
        }
        this.newPost.imagePreviewUrl = URL.createObjectURL(file);
      } else {
        this.removePostImage();
      }
    },
    removePostImage() {
      if (this.newPost.imagePreviewUrl) {
        URL.revokeObjectURL(this.newPost.imagePreviewUrl);
      }
      this.newPost.imageFile = null;
      this.newPost.imagePreviewUrl = null;
      if (this.$refs.postImageInputRef) {
        this.$refs.postImageInputRef.value = null;
      }
    },
    validateNewPost() {
      let isValid = true;
      this.formErrors.title = '';
      this.formErrors.content = '';

      if (!this.newPost.title.trim()) {
        this.formErrors.title = 'Заголовок є обов\'язковим полем.';
        isValid = false;
      }
      if (!this.newPost.content.trim()) {
        this.formErrors.content = 'Зміст допису є обов\'язковим полем.';
        isValid = false;
      }
      return isValid;
    },
    async addComment(postId) {
      const commentText = this.newComment[postId] || "";
      const commentImageFile = this.newCommentImage[postId];

      if (!commentText.trim() && !commentImageFile) {
        alert('Будь ласка, напишіть коментар або додайте зображення!');
        return;
      }

      const formData = new FormData();
      formData.append('text', commentText.trim());
      if (commentImageFile) {
        formData.append('commentImage', commentImageFile);
      }

      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(`http://localhost:8081/${postId}/comment`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const post = this.posts.find(p => p.id === postId);
        if (post) {
          if (!post.comments) {

            post.comments = [];
          }
          const newCommentData = {
            ...response.data,
            author: response.data.user?.name || 'Анонім',
            userId: response.data.user?.id
          };
          post.comments.push(newCommentData);

          this.newComment[postId] = '';
          this.newCommentImage[postId] = null;
          this.newCommentImagePreviewUrls[postId] = null;
          const commentInputRef = `commentImageInput_${postId}`;
          if (this.$refs[commentInputRef] && this.$refs[commentInputRef][0]) {
            this.$refs[commentInputRef][0].value = null;
          } else if (this.$refs[commentInput_ref]) {
            this.$refs[commentInputRef].value = null;
          }
        }
      } catch (e) {
        console.error('Не вдалося додати коментар:', e.response?.data?.message || e.message);
        alert(`Помилка додавання коментаря: ${e.response?.data?.message || e.message}`);
      }
    },

    async deletePost(postId) {
      if (!confirm('Ви впевнені, що хочете видалити цей допис? Усі пов\'язані коментарі також будуть видалені.')) {
        return;
      }
      try {
        const token = localStorage.getItem('jwt');
        await axios.delete(`http://localhost:8081/posts/${postId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        this.posts = this.posts.filter(p => p.id !== postId);
        alert('Допис успішно видалено.');
      } catch (e) {
        console.error('Не вдалося видалити допис:', e.response?.data?.message || e.message);
        alert(`Помилка видалення допису: ${e.response?.data?.message || e.message}`);
      }
    },

    async deleteComment(commentId, postId) {
      if (!confirm('Ви впевнені, що хочете видалити цей коментар?')) {
        return;
      }
      try {
        const token = localStorage.getItem('jwt');
        await axios.delete(`http://localhost:8081/comments/${commentId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });
        const post = this.posts.find(p => p.id === postId);
        if (post && post.comments) {
          post.comments = post.comments.filter(c => c.id !== commentId);
        }
        alert('Коментар успішно видалено.');
      } catch (e) {
        console.error('Не вдалося видалити коментар:', e.response?.data?.message || e.message);
        alert(`Помилка видалення коментаря: ${e.response?.data?.message || e.message}`);
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
            username: author.username,
            name: author.name,
            avatar: author.avatarUrl,
            followers: author.subscribers || 0,
            fullName: author.name || 'Невідомий автор',
            bio: author.bio || '',
            socials: author.socials
                ? (typeof author.socials === 'string' ? JSON.parse(author.socials) : author.socials).map(social => ({
                  name: String(social.name).toLowerCase(),
                  link: social.link
                }))
                : []
          };
          this.tiers = author.tiers || [];
          this.posts = (author.posts || []).map(p => ({
            ...p,
            comments: (p.Comment || p.comments || []).map(c => ({
              id: c.id,
              text: c.text,
              imageUrl: c.imageUrl,
              author: c.user?.name || 'Анонім',
              userId: c.user?.id,
              createdAt: c.createdAt
            }))
          }));
          const genre = author.genre;
          if (genre) {
            try {
              const similarResponse = await axios.get(`http://localhost:8081/authors/${this.username}/similar`);
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
    async submitNewTier() {
      if (!this.validateNewTier()) {
        return;
      }
      this.isSubmittingTier = true;

      try {
        const token = localStorage.getItem('jwt');
        const authorId = this.profile.id;
        if (!authorId) {
          alert("ID автора не знайдено.");
          this.isSubmittingTier = false;
          return;
        }

        const response = await axios.post(`http://localhost:8081/${authorId}/tier`, {
          title: this.newTier.title,
          price: parseFloat(this.newTier.price),
          description: this.newTier.description,
          isChat: this.newTier.isChat
        }, {
          headers: {Authorization: `Bearer ${token}`},
        });

        this.tiers.push(response.data);
        this.newTier = {title: '', price: null, description: '', isChat: false};
        this.tierFormErrors = {title: '', price: '', description: ''};
        alert('Новий рівень підписки успішно додано!');

      } catch (e) {
        console.error('Не вдалося додати рівень:', e.response?.data?.message || e.message);
        alert(`Помилка додавання рівня: ${e.response?.data?.message || e.message}`);
      } finally {
        this.isSubmittingTier = false;
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
    async submitNewPost() {
      if (!this.validateNewPost() || this.isSubmittingPost) {
        return;
      }
      if (!this.profile || !this.profile.id) {
        alert('Не вдалося визначити автора для створення допису.');
        return;
      }

      this.isSubmittingPost = true;
      const formData = new FormData();
      formData.append('title', this.newPost.title);
      formData.append('content', this.newPost.content);
      if (this.newPost.imageFile) {
        formData.append('postImage', this.newPost.imageFile);
      }

      try {
        const token = localStorage.getItem('jwt');
        const response = await axios.post(`http://localhost:8081/${this.profile.id}/post`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const newPostData = {...response.data, comments: []};
        this.posts.unshift(newPostData);

        this.newPost.title = '';
        this.newPost.content = '';
        this.removePostImage();
        this.formErrors.title = '';
        this.formErrors.content = '';
        alert('Допис успішно опубліковано!');

      } catch (e) {
        console.error('Не вдалося створити допис:', e.response?.data?.message || e.message);
        alert(`Помилка створення допису: ${e.response?.data?.message || e.message}`);
      } finally {
        this.isSubmittingPost = false;
      }
    },
    handleCommentImageUpload(postId, event) {
      const file = event.target.files[0];
      if (file) {
        this.newCommentImage[postId] = file;
        this.newCommentImagePreviewUrls[postId] = URL.createObjectURL(file);
      } else {
        this.newCommentImage[postId] = null;
        this.newCommentImagePreviewUrls[postId] = null;
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
        const form = document.createElement("form");
        form.action = "https://www.liqpay.ua/api/3/checkout";
        form.method = "POST";
        form.target = "_blank";
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
.author-profile-page {
  min-height: 100vh;
  color: #e0e0e0;
  font-family: "Raleway", sans-serif;
  padding: 1.5rem 1rem;
}

@media (min-width: 768px) {
  .author-profile-page {
    padding: 2.5rem;
  }
}

.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  color: #a0aec0;
  font-size: 1.1rem;
}


.profile-hero-section {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 2rem 1.5rem;
  background-color: rgba(35, 42, 66, 0.35);
  border-radius: 20px;
  border: 1px solid rgba(0, 247, 255, 0.12);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  animation: hero-fade-in 0.7s ease-out;
}

@keyframes hero-fade-in {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.avatar-glow-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #00f7ff;
  box-shadow: 0 0 18px rgba(0, 247, 255, 0.25);
}

@media (min-width: 768px) {
  .profile-avatar {
    width: 130px;
    height: 130px;
  }
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.2rem;
}

.profile-full-name {
  font-size: 0.95rem;
  color: #b0c4de;
  margin-bottom: 0.2rem;
}

.profile-followers {
  font-size: 0.85rem;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.profile-bio {
  font-size: 0.95rem;
  color: #c5d1e0;
  max-width: 550px;
  margin: 0 auto 1rem auto;
  line-height: 1.65;
}

.profile-socials {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  font-size: 1.35rem;
  color: #b0c4de;
  transition: color 0.3s ease, transform 0.3s ease;
}

.social-link:hover {
  color: #00f7ff;
  transform: scale(1.1);
}

.image-preview {
  max-width: 200px;
  max-height: 150px;
  border: 1px solid #444;
  border-radius: 4px;
  object-fit: cover;
}

.post-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-bottom: 1rem;
  object-fit: cover;
}

.comment-image {
  max-width: 150px;
  max-height: 100px;
  border-radius: 4px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  object-fit: cover;
  display: block;
}

.delete-button {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.delete-button:hover {
  color: #e03131;
}

.post-delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.1rem;
}


.tabs-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .tabs-container {
    gap: 1.25rem;
  }
}

.tab-button {
  padding: 0.6rem 1.2rem;
  border-radius: 30px;
  font-weight: 500;
  font-size: 0.85rem;
  color: #b0c4de;
  background-color: rgba(30, 35, 58, 0.6);
  border: 1px solid rgba(0, 247, 255, 0.2);
  transition: all 0.25s ease;
  cursor: pointer;
}

.tab-button:hover {
  background-color: rgba(0, 247, 255, 0.1);
  color: #00f7ff;
  border-color: rgba(0, 247, 255, 0.35);
}

.tab-button.active {
  background-color: #00f7ff;
  color: #121828;
  border-color: #00f7ff;
  box-shadow: 0 0 12px rgba(0, 247, 255, 0.25);
}

@media (min-width: 640px) {
  .tab-button {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
  }
}

.content-area {
  position: relative;
}


.content-card, .new-post-form, .post-item-card {
  background-color: rgba(30, 35, 58, 0.5);
  backdrop-filter: blur(6px) saturate(120%);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid rgba(0, 247, 255, 0.08);
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 1.25rem;
}

@media (min-width: 768px) {
  .content-card, .new-post-form, .post-item-card {
    padding: 1.75rem;
  }
}

.new-post-form .form-group {
  margin-bottom: 1.25rem;
}

.new-post-form .form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #c5d1e0;
}

.new-post-form .form-label .text-red-500 {
  color: #ef4444;
}

.new-post-form .input-field.w-full {
  width: 100%;
}

.new-post-form .input-field.min-h-\[100px\] {
  min-height: 100px;
}

.file-input-container {
  position: relative;
}

.file-input-label {
  display: inline-block;
  padding: 0.6rem 1.1rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  text-align: center;
}

.file-input-label .mr-2 {
  margin-right: 0.5rem;
}

.file-input-hidden {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
}

.section-subtitle {
  font-size: 1.35rem;
  font-weight: 600;
  color: #07d1ea;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 247, 255, 0.08);
}

.card-form-title {
  font-size: 1.2rem;
  color: #00f7ff;
  margin-bottom: 1rem;
  text-align: center;
}

.preset-amount-button {
  padding: 0.6rem 1rem;
  border-radius: 6px;
  background-color: rgba(0, 247, 255, 0.07);
  color: #00f7ff;
  border: 1px solid rgba(0, 247, 255, 0.15);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  flex-grow: 1;
  min-width: 65px;
  text-align: center;
}

@media (min-width: 640px) {
  .preset-amount-button {
    flex-grow: 0;
  }
}

.preset-amount-button:hover {
  background-color: rgba(0, 247, 255, 0.12);
  border-color: rgba(0, 247, 255, 0.3);
}

.preset-amount-button.selected {
  background-color: #00f7ff;
  color: #121828;
  border-color: #00f7ff;
  box-shadow: 0 0 8px rgba(0, 247, 255, 0.25);
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  color: #b0c4de;
  margin-bottom: 0.25rem;
}

.input-field {

  width: 50%;
  padding: 0.7rem 0.9rem;
  border-radius: 6px;
  background-color: rgba(10, 15, 35, 0.75);
  border: 1px solid rgba(0, 247, 255, 0.25);
  color: #e0e0e0;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-field::placeholder {
  color: #637690;
}

.input-field:focus {
  outline: none;
  border-color: #00f7ff;
  background-color: rgba(10, 15, 35, 0.95);
  box-shadow: 0 0 0 2px rgba(0, 247, 255, 0.15);
}

.form-checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #bdc6d3;
  cursor: pointer;
}

.form-checkbox {
  appearance: none;
  background-color: rgba(10, 15, 35, 0.7);
  border: 1px solid rgba(0, 247, 255, 0.25);
  border-radius: 4px;
  width: 1.15em;
  height: 1.15em;
  cursor: pointer;
  position: relative;
  top: 0.1em;
  margin-right: 0.5rem;
}

.form-checkbox:checked {
  background-color: #00f7ff;
  border-color: #00f7ff;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='rgb(18,24,40)' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}


.cta-button {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #00e8ef, #2e69e0);
  color: #f0f0f0;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 200, 200, 0.2);
  background: linear-gradient(90deg, #1cf0f8, #457bf0);
}

.cta-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.main-action-button {
  margin-top: 0.5rem;
}

.secondary-action-button {
  padding: 0.6rem 1.1rem;
  font-size: 0.85rem;
  background: rgba(0, 247, 255, 0.08);
  color: #00f7ff;
  border: 1px solid rgba(0, 247, 255, 0.25);
  width: auto;
  align-self: flex-end;
}

.secondary-action-button:hover:not(:disabled) {
  background: rgba(0, 247, 255, 0.15);
  border-color: rgba(0, 247, 255, 0.4);
  box-shadow: 0 1px 6px rgba(0, 247, 255, 0.1);
}

.subscriptions-grid {

  --grid-min-item-width: 260px;
  --grid-gap: 2rem;
  --grid-max-columns: 4;

  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: repeat(auto-fill, minmax(
      max(
          var(--grid-min-item-width),
          calc((100% - (var(--grid-max-columns) - 1) * var(--grid-gap)) / var(--grid-max-columns))
      ),
      1fr
  ));
}

.new-tier-form {
  border-style: dashed;
  border-color: rgba(0, 247, 255, 0.25);
  background-color: rgba(30, 35, 58, 0.3);
  padding: 1.5rem;
}

.remove-image-button {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: rgba(255, 70, 70, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.remove-image-button:hover {
  background-color: rgba(224, 49, 49, 1);
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.cta-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #555;
}

.posts-section .section-subtitle {
  border-bottom: none;
  text-align: center;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
}

.post-item-card {
  max-width: 650px;
  width: 100%;
  padding: 1.5rem;
}


.post-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #00f7ff;
  margin-bottom: 0.6rem;
}

.post-content {
  color: #c5d1e0;
  line-height: 1.65;
  margin-bottom: 0.6rem;
  white-space: pre-wrap;
  font-size: 0.95rem;
}

.post-date {
  font-size: 0.75rem;
  color: #7789a0;
  text-align: right;
  margin-bottom: 1rem;
}

.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 247, 255, 0.08);
}

.comment-item {
  background-color: rgba(10, 15, 35, 0.6);
  padding: 0.6rem 0.85rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
  position: relative;
}

.comment-text-display {
  white-space: pre-wrap;
  word-break: break-word;
}

.add-comment-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.comment-textarea {
  font-size: 0.85rem;
  padding: 0.6rem;
}

.comment-button {
  margin-top: 0;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.comment-delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 0.8rem;
}

.input-field-sm {
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
}

.similar-authors-section {
  margin-top: 2.5rem;
  padding: 0 0.5rem;
}

.similar-authors-section .section-title-standalone {
  font-size: 1.6rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.new-post-form .form-group {
  margin-bottom: 1.25rem;
}

.new-post-form .form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #c5d1e0;
}

.new-post-form .form-label .text-red-500 {
  color: #ef4444;
}

.new-post-form .input-field.w-full {
  width: 100%;
}

.new-post-form .input-field.min-h-\[100px\] {
  min-height: 100px;
}


.file-input-container {
  position: relative;
}

.file-input-label {
  display: inline-block;
  padding: 0.6rem 1.1rem;

  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  text-align: center;
}

.file-input-label:hover {
  background: rgba(0, 247, 255, 0.15);
  border-color: rgba(0, 247, 255, 0.4);
  box-shadow: 0 1px 6px rgba(0, 247, 255, 0.1);
}

.file-input-label .mr-2 {
  margin-right: 0.5rem;
}


.file-input-hidden {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
}

.image-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid rgba(0, 247, 255, 0.2);
  object-fit: cover;
}

.similar-authors-section .creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.content-card.donation-form-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .content-card.donation-form-section {
    padding: 1.75rem;
  }
}

.donation-form-section .section-subtitle {
  text-align: center;
  width: 100%;
}

.donation-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 450px;
  margin-bottom: 1.5rem;
}


.donation-form-section .form-group {
  width: 100%;
  max-width: 380px;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donation-form-section .form-label {
  margin-bottom: 0.5rem;
  color: #c5d1e0;
}

.donation-form-section .input-field {
  width: 100%;
  text-align: center;
  font-size: 1rem;
}

.donation-form-section .cta-button.main-action-button {
  width: 100%;
  max-width: 380px;
  margin-top: 0.5rem;
  padding: 0.8rem 1rem;
  font-size: 1rem;
}


.input-field::placeholder {
  text-align: center;
}

.new-tier-form {
  border: 1px dashed rgba(0, 247, 255, 0.4);
}

.new-tier-form .card-form-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #00f7ff;
  text-align: center;
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}

.new-tier-form .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
}


.new-tier-form .form-group {
  margin-bottom: 1.25rem;
}

.new-tier-form .form-label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: #c5d1e0;
}

.new-tier-form .required-star {
  color: #ef4444;
  margin-left: 0.2rem;
}

.new-tier-form .input-field.w-full {
  width: 100%;
}

.new-tier-form .input-field.min-h-\[90px\] {
  min-height: 90px;
  resize: vertical;
}

.new-tier-form .error-message {
  color: #ff8a8a;
  font-size: 0.75rem;
  margin-top: 0.3rem;
  display: block;
}


.checkbox-style-group {
  margin-bottom: 1.5rem;
}

.visually-hidden-checkbox {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
}

.custom-checkbox-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #c5d1e0;
  transition: color 0.2s ease;
}

.custom-checkbox-label:hover {
  color: #00f7ff;
}

.custom-checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 247, 255, 0.5);
  border-radius: 4px;
  margin-right: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  flex-shrink: 0;
}

.visually-hidden-checkbox:checked + .custom-checkbox-label .custom-checkbox-box {
  background-color: #00f7ff;
  border-color: #00f7ff;
}

.custom-checkbox-tick {
  color: #121828;
  font-size: 11px;
}

.visually-hidden-checkbox:focus + .custom-checkbox-label .custom-checkbox-box {
  box-shadow: 0 0 0 3px rgba(0, 247, 255, 0.2);
}

.new-tier-form .cta-button.main-action-button {
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  font-size: 1rem;
}

.new-tier-form .cta-button:disabled {
  background: #525f7f;
  opacity: 0.7;
  cursor: not-allowed;
}

.new-tier-form .cta-button:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>