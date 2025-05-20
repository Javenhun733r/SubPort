<!-- App.vue -->
<template>
  <div class="app">
    <Navigation/>
    <main>
      <router-view/>
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
  background: linear-gradient(-45deg, #fce0e5, #d8e2fc, #c8d9fc, #d8cffc);
  background-size: 400% 400%;
  animation: gradientBG 25s ease infinite;;
}

main {
  flex: 1;
  padding: 20px;
}
</style>
