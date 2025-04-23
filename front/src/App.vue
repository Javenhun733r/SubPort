<!-- App.vue -->
<template>
  <div class="app">
    <Navigation />
    <main>
      <router-view />
    </main>
    <footer></footer>
  </div>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
</script>

<style>
body, html, #app {
  height: 100%;
  margin: 0;
  font-family: "Raleway", sans-serif;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* Щоб контент не налипав */
main {
  flex: 1;
  padding: 20px;
}
</style>
