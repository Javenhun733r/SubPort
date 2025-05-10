<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo">
        <router-link to="/" class="text-logo">SubPort</router-link>
      </div>

      <button
          class="mobile-nav-toggle"
          @click="toggleMobileMenu"
          :class="{ 'is-active': isMobileMenuOpen }"
          aria-label="Меню"
          aria-expanded="isMobileMenuOpen"
          aria-controls="nav-links-list"
      >
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </button>

      <ul class="nav-links" :class="{ open: isMobileMenuOpen }" id="nav-links-list">
        <li v-if="isAdmin" @click="closeMobileMenu"><router-link to="/requests_page">Управління заявками</router-link></li>
        <li v-if="isAuth" @click="closeMobileMenu"><router-link to="/add-author">Додати сторінку</router-link></li>
        <li v-if="isAuth" @click="closeMobileMenu"><router-link to="/main">Головна</router-link></li>
        <li v-if="isAuth" @click="closeMobileMenu"><router-link to="/chat">Чати</router-link></li>
        <li v-if="isAuth" @click="closeMobileMenu"><router-link to="/profile">Профіль</router-link></li>
        <li v-if="isAuth" class="nav-item-logout">
          <button @click="handleLogout" class="logout-button">Вийти</button>
        </li>
        <li v-if="!isAuth" @click="closeMobileMenu"><router-link to="/login">Увійти</router-link></li>
        <li v-if="!isAuth" @click="closeMobileMenu"><router-link to="/signup" class="signup-button">Зареєструватися</router-link></li>
      </ul>
    </div>
  </nav>
</template>

<script>
import axios from "axios";

export default {
  name: "Nav-bar", // Змінено на Nav-bar для відповідності імені компонента
  data() {
    return {
      isAuth: false,
      isAdmin: false,
      jwt: "",
      isMobileMenuOpen: false, // Для стану мобільного меню
    };
  },
  async mounted() {
    this.checkAuthState();
    window.addEventListener('storage', this.handleStorageChange); // Слухаємо зміни в localStorage
  },
  beforeUnmount() { // Використовуємо beforeUnmount для Vue 3
    window.removeEventListener('storage', this.handleStorageChange);
  },
  watch: {
    '$route'() {
      // Перевіряти стан авторизації при кожній зміні маршруту,
      // якщо це необхідно для вашої логіки (наприклад, якщо токен може стати недійсним)
      this.checkAuthState();
      this.closeMobileMenu(); // Закривати мобільне меню при переході по посиланню
    }
  },
  methods: {
    async checkAuthState() {
      const jwtToken = localStorage.getItem("jwt");
      this.isAuth = jwtToken !== null;
      this.jwt = jwtToken;

      if (this.isAuth) {
        try {
          const res = await axios.get('http://localhost:8081/profile', {
            headers: { Authorization: `Bearer ${this.jwt}` },
          });
          this.isAdmin = res.data.user.role === 'ADMIN';
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Можливо, токен недійсний, варто розлогінити користувача
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            this.performLogoutActions();
            this.$router.push('/login'); // Редірект на сторінку входу
          }
        }
      } else {
        this.isAdmin = false; // Якщо не авторизований, то не адмін
      }
    },
    performLogoutActions() {
      this.isAuth = false;
      this.isAdmin = false;
      this.jwt = ""; // Очистити токен з data
      localStorage.removeItem("jwt");
      this.closeMobileMenu();
    },
    logout() {
      this.performLogoutActions();
      // Редірект на головну або сторінку входу, якщо потрібно
      if (this.$route.meta.requiresAuth) { // Якщо поточний маршрут вимагає авторизації
        this.$router.push('/');
      }
    },
    handleLogout() { // Окремий метод для кнопки, щоб можна було додати closeMobileMenu
      this.logout();
      this.closeMobileMenu();
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
    handleStorageChange(event) {
      if (event.key === 'jwt') {
        // JWT токен змінився в іншому вікні/вкладці
        this.checkAuthState();
      }
    }
  },
};
</script>

<style scoped>
.navbar {
  background-color: #1a1a1a; /* Темний фон */
  color: #f0f0f0; /* Світлий текст */
  padding: 15px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* Більш виразна тінь для темного фону */
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  font-family: "Raleway", sans-serif;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 2rem; /* Ще трохи більший лого */
  font-weight: 700;
}

.text-logo {
  text-decoration: none;
  color: #00f7ff; /* Яскравий акцентний колір для лого */
  transition: color 0.3s ease;
}

.text-logo:hover {
  color: #5ae5e5; /* Трохи світліший при наведенні */
}

.nav-links {
  list-style: none;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-left: 30px; /* Трохи більші відступи */
}

.nav-links li a,
.nav-links li button {
  color: #e0e0e0;
  text-decoration: none;
  font-size: 1.1rem; /* Трохи більший шрифт посилань */
  font-weight: 500;
  padding: 10px 15px;
  border-radius: 8px; /* Більш помітне заокруглення */
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  display: block;
}

.nav-links li a:hover,
.nav-links li button:hover {
  background-color: rgba(0, 247, 255, 0.1); /* Легкий акцентний фон при наведенні */
  color: #00f7ff;
  transform: scale(1.05); /* Легке збільшення при наведенні */
}

/* Стиль для активного посилання */
.nav-links li a.router-link-exact-active {
  color: #00f7ff;
  font-weight: 700;
  background-color: rgba(0, 247, 255, 0.2); /* Більш виражений акцентний фон для активного */
}

.logout-button,
.signup-button {
  background-color: rgba(0, 247, 255, 0.4);
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease, color 0.3s ease;
}

.logout-button:hover,
.signup-button:hover {
  background-color: #5ae5e5;
  color: #1a1a1a;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 2px 6px rgba(0, 247, 255, 0.4); /* Акцентна тінь при наведенні */
}

.signup-button {
  background-color: #2ecc71; /* Інший акцентний колір для реєстрації */
  color: #1a1a1a; /* Темний текст для контрасту */
}
.signup-button:hover {
  background-color: #27ae60; /* Трохи темніший зелений */
  color: #1a1a1a;
}


/* --- Мобільне меню --- */
.mobile-nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
}

.hamburger-box {
  width: 35px; /* Збільшено для кращої видимості */
  height: 28px;
  display: inline-block;
  position: relative;
}

.hamburger-inner {
  display: block;
  top: 50%;
  margin-top: -1.5px; /* Половина висоти лінії (3px / 2) */
  width: 100%;
  height: 3px; /* Товщина лінії */
  background-color: #f0f0f0; /* Колір ліній гамбургера на темному фоні */
  border-radius: 3px;
  position: absolute;
  transition-property: transform;
  transition-duration: 0.25s;
  transition-timing-function: ease;
}

.hamburger-inner::before,
.hamburger-inner::after {
  content: "";
  display: block;
  width: 100%;
  height: 3px;
  background-color: #f0f0f0;
  border-radius: 3px;
  position: absolute;
  transition-property: transform;
  transition-duration: 0.25s;
  transition-timing-function: ease;
}

.hamburger-inner::before {
  top: -10px;
}

.hamburger-inner::after {
  bottom: -10px;
}

/* Анімація гамбургера в хрестик */
.mobile-nav-toggle.is-active .hamburger-inner {
  transform: rotate(45deg);
  transition-delay: 0.12s;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
}
.mobile-nav-toggle.is-active .hamburger-inner::before {
  top: 0;
  transform: rotate(-90deg);
  transition: top 0.1s ease-out, transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;
}
.mobile-nav-toggle.is-active .hamburger-inner::after {
  bottom: 0;
  transform: rotate(-90deg);
  transition: bottom 0.1s ease-out, transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;
}


@media (max-width: 768px) {
  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #1a1a1a; /* Темний фон для мобільного меню */
    flex-direction: column;
    align-items: stretch;
    padding: 10px 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-top: 1px solid #222; /* Трохи світліший бордер для темної теми */
  }

  .nav-links.open {
    display: flex;
    animation: slideIn 0.3s ease-out forwards;
  }

  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; } /* Починаємо трохи вище */
    to { transform: translateY(0); opacity: 1; }
  }

  .nav-links li {
    margin-left: 0;
    text-align: center;
    width: 100%;
  }

  .nav-links li a,
  .nav-links li button {
    padding: 18px 20px; /* Збільшено падінги для зручності на мобільних */
    border-radius: 0;
    border-bottom: 1px solid #252525; /* Розділювач між пунктами */
  }
  .nav-links li:last-child a,
  .nav-links li:last-child button {
    border-bottom: none;
  }

  .nav-links li a:hover,
  .nav-links li button:hover {
    background-color: rgba(0, 247, 255, 0.15); /* Трохи яскравіший ховер */
  }

  .nav-links li a.router-link-exact-active {
    background-color: rgba(0, 247, 255, 0.25);
  }

  .mobile-nav-toggle {
    display: block;
  }

  .nav-item-logout {
    padding: 0;
  }
  .logout-button, .signup-button {
    width: calc(100% - 40px);
    margin: 10px 20px;
    padding: 15px 0; /* Збільшено падінги */
    box-sizing: border-box;
  }
}
</style>