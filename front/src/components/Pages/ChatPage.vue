<template>
  <div class="chat-container">
    <aside class="sidebar">
      <div class="new-chat-section">
        <input v-model="newChatName" placeholder="Enter chat name..." />
        <button @click="createNewChat">+ Create Chat</button>
      </div>

      <div
          class="chat-item"
          v-for="chat in chats"
          :key="chat.id"
          :class="{ active: chat.id === selectedChatId }"
          @click="selectChat(chat.id)"
      >
        {{ chat.name }}
        <button class="delete-btn" @click.stop="deleteChat(chat.id)">✕</button>
      </div>


      <div class="user" v-for="user in users" :key="user.id">
        {{ user.name }}
      </div>
    </aside>

    <main class="chat">
      <div class="messages">
        <div class="message" v-for="msg in messages" :key="msg.id">
          <span class="author">{{ msg.author }}:</span>
          <span class="text">{{ msg.text }}</span>
        </div>
      </div>
      <form @submit.prevent="sendMessage" class="input-area">
        <input v-model="newMessage" placeholder="Type your message..." />
        <button type="submit">Send</button>
      </form>
    </main>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';



const newChatName = ref('');
const chats = ref([]);
const selectedChatId = ref(null);
const messages = ref([]);
const newMessage = ref('');
let socket;

onMounted(async () => {
  socket = new WebSocket('ws://localhost:8081');

  socket.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.chatId === selectedChatId.value) {
      messages.value.push(msg);
    }
  });

  try {
    const token = localStorage.getItem('jwt');
    const res = await axios.get('http://localhost:8081/chats/user/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    chats.value = res.data;
  } catch (err) {
    console.error('Failed to load chats', err);
  }
});

onBeforeUnmount(() => {
  if (socket) socket.close();
});

async function createNewChat() {
  const name = newChatName.value.trim();
  if (!name) return;

  try {
    const res = await axios.post('http://localhost:8081/chats', {
      name,
      userIds: [1, 2] // змінити за потреби
    });
    const chat = res.data;
    chats.value.push(chat);
    selectedChatId.value = chat.id;
    messages.value = [];
    newChatName.value = '';
  } catch (err) {
    console.error('Failed to create chat', err);
  }
}

async function selectChat(chatId) {
  selectedChatId.value = chatId;
  messages.value = [];
  try {
    const res = await axios.get(`http://localhost:8081/chats/${chatId}/messages`);
    messages.value = res.data.map(msg => ({
      id: msg.id,
      author: msg.sender.name,
      text: msg.text,
      chatId: msg.chatId
    }));
  } catch (err) {
    console.error('Failed to load messages', err);
  }
}
async function deleteChat(chatId) {
  try {
    await axios.delete(`http://localhost:8081/chats/${chatId}`);
    chats.value = chats.value.filter(chat => chat.id !== chatId);
    if (selectedChatId.value === chatId) {
      selectedChatId.value = null;
      messages.value = [];
    }
  } catch (err) {
    console.error('Failed to delete chat', err);
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedChatId.value) return;

  const msg = {
    text: newMessage.value,
    chatId: selectedChatId.value,
    senderId: 1
  };

  try {
    await axios.post(`http://localhost:8081/chats/${selectedChatId.value}/messages`, msg);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        ...msg,
        author: 'You',
        id: Date.now()
      }));
    }

    messages.value.push({ ...msg, author: 'You', id: Date.now() });
    newMessage.value = '';
  } catch (err) {
    console.error('Failed to send message', err);
  }
}


</script>

<style scoped>
.chat-container {
  display: flex;
  height: 85vh;
  background: transparent;
  backdrop-filter: blur(10px);
  color: #00ffb2;
  font-family: 'Orbitron', sans-serif;
}

.sidebar {
  width: 250px;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-right: 1px solid #0ff;
}

.user {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #ff00cc;
  border-radius: 8px;
  cursor: pointer;
}

.chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.2);
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.message {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 255, 255, 0.1);
  border-left: 3px solid #f700ff;
}

.author {
  font-weight: bold;
  color: #7300ff;
}

.input-area {
  display: flex;
  gap: 0.5rem;
}

.input-area input {
  flex: 1;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid #0ff;
  color: #0ff;
  outline: none;
  border-radius: 4px;
}

.input-area button {
  background: #0ff;
  color: #000;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.new-chat-section {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.new-chat-section input {
  padding: 0.5rem;
  border: 1px solid #0ff;
  background: transparent;
  color: #0ff;
  border-radius: 4px;
  outline: none;
}

.new-chat-section button {
  padding: 0.5rem;
  background-color: #0ff;
  color: #000;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: rgba(0, 255, 255, 0.1);
  border: 1px solid #0ff;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.chat-item.active {
  background-color: rgba(255, 0, 255, 0.2);
  border-color: #ff00ff;
}

.chat-item:hover {
  background-color: rgba(0, 255, 255, 0.2);
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ff0044;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  font-size: 1rem;
}


</style>
