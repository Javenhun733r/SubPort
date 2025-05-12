<template>
  <div class="subscription-card">
    <h3 class="subscription-card__title">{{ title }}</h3>
    <p class="subscription-card__price">
      {{ price }} ₴<span class="subscription-card__price-period">/міс</span>
    </p>
    <button @click="handleSubscriptionPayment" class="subscription-card__button">
      Підписатися
    </button>
    <p class="subscription-card__description">{{ description }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ['id', 'title', 'price', 'description', 'isChat', 'username'],
  data() {
    return {
      liqpayData: null,
      liqpaySignature: null
    };
  },
  methods: {
    async handleSubscriptionPayment() {
      if (!this.title || typeof this.price !== 'number' || this.price <= 0) {
        alert("Будь ласка, переконайтеся, що всі деталі тарифу вказані правильно і ціна є коректною.");
        return;
      }

      console.log("Subscription ID:", this.id, "Price:", this.price, "Title:", this.title, "User:", this.username);
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          alert("Помилка автентифікації. Будь ласка, увійдіть знову.");
          return;
        }

        const response = await axios.post("http://localhost:8081/api/create-subscription", {
          id: this.id,
          amount: this.price,
          title: this.title,
          username: this.username
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
        document.body.removeChild(form);

        if (this.isChat) {
          this.$emit('addUserToChat');
        }

      } catch (error) {
        if (error.response) {
          alert(` ${error.response.data.message || 'Не вдалося обробити запит.'}`);
        } else if (error.request) {
          console.error("Не вдалося здійснити оплату підписки (немає відповіді від сервера):", error.request);
          alert("Не вдалося підключитися до сервера оплати. Перевірте ваше інтернет-з'єднання та спробуйте пізніше.");
        } else {
          console.error("Не вдалося здійснити оплату підписки (загальна помилка):", error);
          alert("Сталася неочікувана помилка під час оплати. Будь ласка, спробуйте ще раз.");
        }
      }
    },
  }
}
</script>

<style>
:root {
  --neon-cyan: #00f0ff;
  --neon-cyan-hover: #00d8e6; /* Трохи яскравіший/змінений для кнопки при наведенні */
  --card-background: #0d1117;
  --text-white: #ffffff;
  --text-black: #000000;
  --text-description: #8b949e;
  --shadow-color: rgba(0, 220, 255, 0.3);
  --shadow-color-hover: rgba(0, 230, 255, 0.55); /* Збільшена яскравість для ховеру картки */
  --shadow-color-text: rgba(0, 220, 255, 0.6);
  --button-shadow-color: rgba(0, 240, 255, 0.4); /* Тінь для кнопки */
  --button-shadow-color-strong: rgba(0, 240, 255, 0.6); /* Сильніша тінь для пульсації кнопки */
}

.subscription-card {
  background-color: var(--card-background);
  padding: 1.75rem;
  border-radius: 1rem;
  border: 2px solid var(--neon-cyan); /* Чітка ціанова рамка */
  width: 100%;
  max-width: 360px;
  margin: 2rem auto;
  /* Оновлена тінь для кращого виділення рамки */
  box-shadow: 0 0 0 2px var(--card-background), /* Відокремлення для світіння рамки */
  0 0 8px 2px var(--neon-cyan),   /* Яскравіше світіння близько до рамки */
  0 0 25px 6px var(--shadow-color); /* Загальне м'яке світіння */
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  position: relative; /* Для можливих псевдо-елементів у майбутньому */
}

.subscription-card:hover {
  /* Оновлена тінь при наведенні */
  box-shadow: 0 0 0 2.5px var(--card-background),
  0 0 12px 3px var(--neon-cyan), /* Посилене світіння рамки */
  0 0 35px 8px var(--shadow-color-hover);
  transform: translateY(-7px); /* Трохи більший підйом */
}

.subscription-card__title {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--neon-cyan);
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 0 5px var(--shadow-color-text), 0 0 10px var(--shadow-color-text);
}

.subscription-card__price {
  font-size: 2.75rem;
  font-weight: 800;
  color: var(--text-white);
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.1;
}

.subscription-card__price-period {
  font-size: 1rem;
  font-weight: 500;
  color: var(--neon-cyan);
  opacity: 0.9;
  margin-left: 0.25rem;
}

.subscription-card__button {
  width: 100%;
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--neon-cyan);
  color: var(--text-black);
  border: none;
  border-radius: 50px;
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  outline: none;
  position: relative; /* Для тіні */
  /* Початкова тінь та анімація */
  box-shadow: 0 0 8px var(--button-shadow-color), 0 0 12px var(--button-shadow-color);
  animation: pulse-button-shadow 2.5s infinite ease-in-out;
  transition: background-color 0.2s ease-out, transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.subscription-card__button:hover,
.subscription-card__button:focus {
  background-color: var(--neon-cyan-hover);
  transform: scale(1.05); /* Збільшене масштабування */
  /* Яскравіша тінь при наведенні/фокусі, анімація зупиняється */
  box-shadow: 0 0 12px var(--neon-cyan), 0 0 22px var(--neon-cyan-hover);
  animation: none; /* Зупиняємо анімацію пульсації */
}

.subscription-card__description {
  font-size: 0.875rem;
  color: var(--text-description);
  line-height: 1.6;
  text-align: center;
}

@keyframes pulse-button-shadow {
  0% {
    box-shadow: 0 0 7px var(--button-shadow-color), 0 0 10px var(--button-shadow-color);
    transform: scale(1.0);
  }
  50% {
    box-shadow: 0 0 12px var(--button-shadow-color-strong), 0 0 18px var(--button-shadow-color-strong);
    transform: scale(1.015); /* Легке збільшення під час пульсації */
  }
  100% {
    box-shadow: 0 0 7px var(--button-shadow-color), 0 0 10px var(--button-shadow-color);
    transform: scale(1.0);
  }
}

@media (max-width: 400px) {
  .subscription-card {
    padding: 1.25rem;
    max-width: 90%;
  }
  .subscription-card__title {
    font-size: 1.375rem;
  }
  .subscription-card__price {
    font-size: 2.25rem;
  }
  .subscription-card__price-period {
    font-size: 0.875rem;
  }
  .subscription-card__button {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
  .subscription-card__description {
    font-size: 0.8125rem;
  }
}
</style>