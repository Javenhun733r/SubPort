<template>
  <div class="chat-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <input type="text" placeholder="Знайти або почати новий чат..." class="search-chat-input"/>
      </div>
      <div class="chat-list-container">
        <div class="chat-item" v-for="chat in chats" :key="chat.id" :class="{ active: chat.id === selectedChatId }" @click="selectChat(chat.id)" tabindex="0">
          <span class="chat-icon">💬</span>
          <span class="chat-name">{{ chat.name }}</span>
          <button class="delete-btn" @click.stop="deleteChat(chat.id)" title="Видалити чат">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>
          </button>
        </div>
      </div>
      <div class="users-section">
        <h3 class="users-section-title">Учасники чату</h3>
        <div class="user-list-container">
          <div class="user" v-for="user in currentChatUsers" :key="user.userId" :title="user.username"> <span class="user-avatar" :style="{ backgroundColor: getUserColor(user.username) }">{{ user.username.substring(0,1).toUpperCase() }}</span>
            <span class="user-name">{{ user.username }}</span>
            <span class="status-indicator" :class="{ online: user.isOnline, offline: !user.isOnline }"></span>
          </div>
          <div v-if="!currentChatUsers || currentChatUsers.length === 0 && selectedChatId" class="no-users"> Немає активних користувачів у цьому чаті.
          </div>
        </div>
      </div>
    </aside>

    <main class="chat-area">
      <header class="chat-header" v-if="selectedChatId && selectedChat">
        <h3>{{ selectedChat.name }}</h3>
        <span class="online-count" v-if="onlineUsersInCurrentChatCount > 0">
          {{ onlineUsersInCurrentChatCount }} онлайн
        </span>
      </header>
      <div class="messages-container" ref="messagesContainerRef">
        <div class="message-wrapper" v-for="msg in messages" :key="msg.id" :class="{ 'my-message': msg.authorId === currentUserId }">
          <div class="message" :class="`message-type-${msg.messageType || 'text'}`">
            <span class="author" v-if="msg.authorId !== currentUserId && msg.messageType !== 'info'">{{ msg.author }}:</span>

            <span class="text" v-if="msg.messageType === 'text' || !msg.messageType">{{ msg.text }}</span>

            <div v-if="msg.messageType === 'image'" class="message-image-container">
              <img :src="msg.fileUrl" :alt="msg.fileName || 'Зображення'" @click="openImageModal(msg.fileUrl)" class="message-image"/>
              <p v-if="msg.text" class="image-caption">{{ msg.text }}</p>
            </div>

            <div v-if="msg.messageType === 'file'" class="message-file-container">
              <a :href="msg.fileUrl" target="_blank" download class="file-link">
                <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 18H20V20H4V18Z"></path></svg>
                <span class="file-name">{{ msg.fileName || 'Завантажити файл' }}</span>
              </a>
              <p v-if="msg.text" class="file-caption">{{ msg.text }}</p>
            </div>
            <div v-if="msg.messageType === 'info'" class="message-info">
              {{ msg.text }}
            </div>

            <span class="timestamp">{{ formatTimestamp(msg.timestamp) }}</span>
          </div>
        </div>
      </div>
      <div class="typing-indicator-container" v-if="typingDisplayMessage">
        <span>{{ typingDisplayMessage }}</span>
      </div>

      <div v-if="fileToUploadPreview" class="file-preview-area">
        <img v-if="fileToUpload && fileToUpload.type.startsWith('image/')" :src="fileToUploadPreview" alt="Preview" class="image-preview"/>
        <div v-else class="file-info-preview">
          <svg class="file-icon-preview" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32px" height="32px"><path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 18H20V20H4V18Z"></path></svg>
          <span>{{ fileToUpload.name }} ({{ (fileToUpload.size / 1024).toFixed(1) }} KB)</span>
        </div>
        <button @click="clearFileToUpload" class="clear-preview-btn" title="Скасувати">&times;</button>
      </div>
      <div v-if="isFileUploading" class="upload-progress-bar">
        <div class="progress" :style="{ width: uploadProgress + '%' }"></div>
        <span>Завантаження: {{ uploadProgress }}%</span>
      </div>


      <form @submit.prevent="prepareAndSendMessage" class="input-area" v-if="selectedChatId">
        <button type="button" @click="triggerFileInput" class="attach-file-btn" title="Прикріпити файл">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M14.8284 7.75736L16.2426 6.34315C18.5858 4.00001 22.3358 4.00001 24.6789 6.34315C27.0221 8.68629 27.0221 12.4363 24.6789 14.7794L16.9497 22.5086C13.9201 25.5382 8.97003 25.5382 5.94046 22.5086C2.91089 19.479 2.91089 14.529 5.94046 11.4994L13.4142 4.02477C15.1716 2.26738 18.0995 2.26738 19.8569 4.02477C21.6142 5.78216 21.6142 8.71006 19.8569 10.4674L12.3858 17.9385C11.6047 18.7196 10.3384 18.7196 9.55736 17.9385C8.77631 17.1575 8.77631 15.8912 9.55736 15.1101L15.7279 8.93953L14.3137 7.52532L8.14315 13.6959C6.5805 15.2585 6.5805 17.7852 8.14315 19.3478C9.70579 20.9105 12.2325 20.9105 13.7951 19.3478L21.2678 11.8768C23.8086 9.33596 23.8086 5.15622 21.2678 2.61539C18.7269 0.0745631 14.5472 0.0745631 11.9992 2.61539L4.26997 10.3446C0.488131 14.1265 0.488131 20.2324 4.26997 24.0142C8.05181 27.7961 14.1577 27.7961 17.9395 24.0142L25.6688 16.285C26.4499 15.5039 26.4499 14.2376 25.6688 13.4565C24.8878 12.6755 23.6215 12.6755 22.8405 13.4565L14.8284 7.75736Z"></path></svg>
        </button>
        <input type="file" ref="fileInputRef" @change="handleFileChange" style="display: none;" accept="image/*, application/pdf, .doc, .docx, .txt, .zip">

        <input v-model="newMessage" placeholder="Напишіть повідомлення..." @input="handleTyping" @blur="stopTyping(true)" />
        <button type="submit" title="Надіслати" :disabled="isSending || isFileUploading">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M3 13.0001H9V11.0001H3V1.8457C3 1.56931 3.22386 1.34546 3.5 1.34546C3.58495 1.34546 3.66798 1.36733 3.74195 1.40804L22.742 11.408C23.0481 11.571 23.1384 11.9648 22.9754 12.2709C22.9097 12.3919 22.8181 12.4941 22.7071 12.571L3.70708 22.571C3.42114 22.7618 3.03116 22.7278 2.84033 22.4418C2.71447 22.2539 2.66604 22.0236 2.71779 21.8043L3 13.0001Z"></path></svg>
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const chats = ref([]);
const selectedChatId = ref(null);
const messages = ref([]);
const newMessage = ref('');
let socket;
const messagesContainerRef = ref(null);
const isSending = ref(false);
const fileInputRef = ref(null);
const fileToUpload = ref(null);
const fileToUploadPreview = ref(null);
const isFileUploading = ref(false);
const uploadProgress = ref(0);

const currentUserId = ref(null);
const currentUsername = ref('');

// usersInChats - для зберігання даних з сервера, якщо вони потрібні десь ще
// const usersInChats = ref({}); // Можливо, не потрібне, якщо currentChatUsers достатньо
const currentChatUsers = ref([]); // Для відображення учасників поточного чату
const typingUsers = ref({});

let typingTimeout = null;
const TYPING_TIMER_LENGTH = 1500;

const token = localStorage.getItem('jwt');

if (token) {
  try {
    const decodedToken = jwt_decode(token);
    currentUserId.value = decodedToken.id;
    currentUsername.value = decodedToken.name;
  } catch (e) {
    console.error("Failed to decode JWT:", e);
  }
}

const selectedChat = computed(() => {
  return chats.value.find(chat => chat.id === selectedChatId.value);
});

const onlineUsersInCurrentChatCount = computed(() => {
  return currentChatUsers.value.filter(u => u.isOnline).length;
});

const typingDisplayMessage = computed(() => {
  if (!selectedChatId.value || !typingUsers.value[selectedChatId.value]) {
    return '';
  }
  const usersTypingNow = typingUsers.value[selectedChatId.value]
      .filter(user => user.userId !== currentUserId.value)
      .map(user => user.username);

  if (usersTypingNow.length === 0) return '';
  if (usersTypingNow.length === 1) return `${usersTypingNow[0]} друкує...`;
  if (usersTypingNow.length === 2) return `${usersTypingNow.join(' та ')} друкують...`;
  return `${usersTypingNow.slice(0, 2).join(', ')} та інші друкують...`;
});

function openImageModal(imageUrl) {
  console.log("STUB: Open image modal for:", imageUrl);
  // Ваша реалізація модального вікна
}


onMounted(async () => {
  if (!token || !currentUserId.value) {
    console.error('No JWT token or user ID. Aborting setup.');
    return;
  }
  try {
    const res = await axios.get('http://localhost:8081/chats/user/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    chats.value = res.data;
  } catch (err) {
    console.error('Failed to load chats:', err.response?.data || err.message);
  }

  socket = new WebSocket(`ws://localhost:8081?token=${token}`);

  socket.onopen = () => {
    console.log('WebSocket connection established.');
    if (selectedChatId.value != null) {
      console.log(`Socket opened, joining pre-selected chat: ${selectedChatId.value}`);
      socket.send(JSON.stringify({ type: 'join', chatId: Number(selectedChatId.value) }));
    }
  };

  socket.onmessage = (event) => {
    let serverMsg;
    try {
      serverMsg = JSON.parse(event.data);
    } catch (e) {
      console.error('Failed to parse WebSocket message:', event.data, e);
      return;
    }

    console.log('CLIENT: WebSocket message received:', JSON.parse(JSON.stringify(serverMsg)));

    switch (serverMsg.type) {
      case 'chatMessage':
        console.log(`CLIENT: Received chatMessage for chat ${serverMsg.chatId}. Current selected chat: ${selectedChatId.value} (type: ${typeof selectedChatId.value}). Msg chatId type: ${typeof serverMsg.chatId}`);
        // Переконуємося, що порівнюємо числа
        if (Number(serverMsg.chatId) === Number(selectedChatId.value)) {
          console.log('CLIENT: Processing chatMessage for selected chat:', serverMsg);
          const newMessageData = {
            id: serverMsg.id,
            author: serverMsg.author,
            authorId: serverMsg.authorId,
            text: serverMsg.text,
            chatId: Number(serverMsg.chatId), // Зберігаємо як число
            timestamp: serverMsg.timestamp || new Date().toISOString(),
            messageType: serverMsg.messageType || 'text',
            fileUrl: serverMsg.fileUrl || null,
            fileName: serverMsg.fileName || null,
            fileType: serverMsg.fileType || null,
            fileSize: serverMsg.fileSize || null,
          };
          messages.value.push(newMessageData);
          console.log('CLIENT: Pushed message to UI messages array.');

          if (serverMsg.chatId && typingUsers.value[serverMsg.chatId]) {
            typingUsers.value[serverMsg.chatId] = typingUsers.value[serverMsg.chatId].filter(
                u => u.userId !== serverMsg.authorId
            );
          }
        } else {
          console.log('CLIENT: Received chatMessage for a different chat. Not displaying.');
        }
        break;
      case 'userTyping':
        if (Number(serverMsg.chatId) === Number(selectedChatId.value) && serverMsg.userId !== currentUserId.value) {
          const chatIdStr = String(serverMsg.chatId); // Використовуємо рядки як ключі для typingUsers
          if (!typingUsers.value[chatIdStr]) {
            typingUsers.value[chatIdStr] = [];
          }
          let userList = typingUsers.value[chatIdStr];
          const existingUserIndex = userList.findIndex(u => u.userId === serverMsg.userId);

          if (serverMsg.isTyping) {
            if (existingUserIndex === -1) {
              userList.push({ userId: serverMsg.userId, username: serverMsg.username });
            }
          } else {
            if (existingUserIndex !== -1) {
              userList.splice(existingUserIndex, 1);
            }
          }
          // typingUsers.value[chatIdStr] = [...userList]; // Для гарантованої реактивності, якщо простий push не спрацьовує
        }
        break;
      case 'usersInChat':
        console.log(`CLIENT: Received usersInChat for chat ${serverMsg.chatId}. Current selected chat: ${selectedChatId.value}`);
        if (Number(serverMsg.chatId) === Number(selectedChatId.value)) {
          currentChatUsers.value = serverMsg.users.map(u => ({
            userId: u.userId,
            username: u.username,
            isOnline: u.isOnline // Клієнт вже очікує це поле
          }));
          console.log('CLIENT: Updated currentChatUsers:', currentChatUsers.value);
        }
        break;
      case 'error':
        console.error('CLIENT: Server WebSocket error:', serverMsg.message);
        alert(`Помилка від сервера: ${serverMsg.message}`);
        break;
      default:
        console.log('CLIENT: Received unhandled WebSocket message type:', serverMsg.type, serverMsg);
    }
  };

  socket.onclose = (event) => {
    console.log('CLIENT: WebSocket connection closed:', event.code, event.reason);
  };

  socket.onerror = (error) => {
    console.error('CLIENT: WebSocket error:', error);
  };
});

onBeforeUnmount(() => {
  if (selectedChatId.value != null && socket && socket.readyState === WebSocket.OPEN) {
    stopTyping(false);
  }
  if (socket) {
    socket.close();
    console.log('CLIENT: WebSocket connection closed on component unmount.');
  }
});

watch(messages, async () => {
  await nextTick();
  if (messagesContainerRef.value) {
    messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
  }
}, { deep: true });

async function selectChat(chatId) {
  const numChatId = Number(chatId); // Працюємо з числовим ID
  if (selectedChatId.value === numChatId) return;

  console.log(`CLIENT: Selecting chat ${numChatId}. Previous: ${selectedChatId.value}`);

  if (selectedChatId.value != null && socket && socket.readyState === WebSocket.OPEN) {
    stopTyping(false, selectedChatId.value);
    // Можливо, варто відправити 'leave' для старого чату, якщо сервер це підтримує
    // socket.send(JSON.stringify({ type: 'leave', chatId: Number(selectedChatId.value) }));
  }
  if (selectedChatId.value != null) { // Очищаємо typingUsers для попереднього чату
    typingUsers.value[String(selectedChatId.value)] = [];
  }


  selectedChatId.value = numChatId;
  messages.value = [];
  currentChatUsers.value = [];


  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log(`CLIENT: Sending join for chat ${numChatId}`);
    socket.send(JSON.stringify({ type: 'join', chatId: numChatId }));
  } else if (socket && socket.readyState === WebSocket.CONNECTING) {
    console.log(`CLIENT: Socket connecting, will send join for ${numChatId} on open.`);
    socket.addEventListener('open', () => {
      console.log(`CLIENT: Socket opened (was connecting), sending join for ${numChatId}`);
      socket.send(JSON.stringify({ type: 'join', chatId: numChatId }));
    }, { once: true });
  } else {
    console.warn('CLIENT: Socket not open or not initialized when trying to select chat.');
    // Тут можна спробувати переініціалізувати сокет, якщо він був закритий непередбачувано
  }

  try {
    console.log(`CLIENT: Fetching messages for chat ${numChatId}`);
    const res = await axios.get(`http://localhost:8081/chats/${numChatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`CLIENT: Received messages for chat ${numChatId}:`, res.data);
    messages.value = res.data.map(msg => ({
      id: msg.id,
      author: msg.sender?.name || 'Unknown',
      authorId: msg.senderId || msg.sender?.id,
      text: msg.text,
      chatId: Number(msg.chatId),
      timestamp: msg.createdAt || msg.updatedAt || new Date().toISOString(),
      messageType: msg.messageType || 'text',
      fileUrl: msg.fileUrl || null,
      fileName: msg.fileName || null,
      fileType: msg.fileType || null,
      fileSize: msg.fileSize || null,
    }));
  } catch (err) {
    console.error(`CLIENT: Failed to load messages for chat ${numChatId}:`, err.response?.data || err.message);
  }
}

function handleTyping() {
  if (!socket || socket.readyState !== WebSocket.OPEN || selectedChatId.value == null) return;

  if (!typingTimeout) {
    console.log(`CLIENT: Sending userStartedTyping for chat ${selectedChatId.value}`);
    socket.send(JSON.stringify({
      type: 'userStartedTyping',
      chatId: Number(selectedChatId.value),
      username: currentUsername.value // Сервер може потребувати username для відображення
    }));
  } else {
    clearTimeout(typingTimeout);
  }

  typingTimeout = setTimeout(() => {
    stopTyping(false);
    typingTimeout = null;
  }, TYPING_TIMER_LENGTH);
}

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) {
    clearFileToUpload();
    return;
  }
  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    alert(`Файл завеликий. Максимальний розмір: ${maxSize / (1024 * 1024)}MB.`);
    clearFileToUpload();
    return;
  }
  fileToUpload.value = file;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => fileToUploadPreview.value = e.target.result;
    reader.readAsDataURL(file);
  } else {
    fileToUploadPreview.value = null;
  }
}

function clearFileToUpload() {
  fileToUpload.value = null;
  fileToUploadPreview.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

async function uploadFileAndGetUrl(file) {
  if (!file) return null;
  const formData = new FormData();
  formData.append('file', file);
  if (selectedChatId.value != null) {
    formData.append('chatId', String(selectedChatId.value)); // Сервер може очікувати chatId в FormData
  }

  isFileUploading.value = true;
  uploadProgress.value = 0;
  try {
    const response = await axios.post('http://localhost:8081/upload-chat-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        } else {
          uploadProgress.value = 0; // Якщо total невідомий
        }
      },
    });
    isFileUploading.value = false;
    console.log('CLIENT: File upload HTTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('CLIENT: Error uploading file via HTTP:', error.response?.data || error.message);
    alert('Помилка завантаження файлу. ' + (error.response?.data?.message || error.message));
    isFileUploading.value = false;
    uploadProgress.value = 0;
    return null;
  }
}

async function prepareAndSendMessage() {
  const textMessage = newMessage.value.trim();
  if (!fileToUpload.value && !textMessage) return;

  if (selectedChatId.value == null) {
    alert('Будь ласка, оберіть чат.');
    return;
  }
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    alert('З\'єднання з сервером чату втрачено. Спробуйте оновити сторінку.');
    return;
  }

  isSending.value = true;
  if (typingTimeout) stopTyping(false);

  let filePayload = null;
  if (fileToUpload.value) {
    const uploadedFileInfo = await uploadFileAndGetUrl(fileToUpload.value);
    if (uploadedFileInfo && uploadedFileInfo.fileUrl) {
      filePayload = {
        fileUrl: uploadedFileInfo.fileUrl,
        fileName: uploadedFileInfo.fileName || fileToUpload.value.name,
        fileType: uploadedFileInfo.fileType || fileToUpload.value.type,
        fileSize: uploadedFileInfo.fileSize || fileToUpload.value.size,
      };
    } else {
      isSending.value = false;
      console.error("CLIENT: Failed to get file info after upload, not sending message.");
      alert("Не вдалося завантажити файл. Повідомлення не надіслано.");
      return;
    }
  }

  let messageType = 'text';
  if (filePayload) {
    messageType = filePayload.fileType && filePayload.fileType.startsWith('image/') ? 'image' : 'file';
  }

  const wsMessage = {
    type: 'newChatMessage',
    chatId: Number(selectedChatId.value), // Надсилаємо chatId як число
    text: textMessage,
    messageType: messageType,
    ...(filePayload && filePayload),
  };

  console.log('CLIENT: Sending WebSocket message (newChatMessage):', wsMessage);
  socket.send(JSON.stringify(wsMessage));

  newMessage.value = '';
  clearFileToUpload();
  isSending.value = false;
}

function stopTyping(isBlurEvent, chatIdOverride = null) {
  const chatToSend = chatIdOverride || selectedChatId.value;
  if (!socket || socket.readyState !== WebSocket.OPEN || chatToSend == null) return;

  if (typingTimeout || isBlurEvent) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
    console.log(`CLIENT: Sending userStoppedTyping for chat ${chatToSend}`);
    socket.send(JSON.stringify({
      type: 'userStoppedTyping',
      chatId: Number(chatToSend),
    }));
  }
}

async function deleteChat(chatIdToDelete) {
  const numChatIdToDelete = Number(chatIdToDelete);
  const chatName = chats.value.find(c => c.id === numChatIdToDelete)?.name || 'цей чат';
  if (!confirm(`Ви впевнені, що хочете видалити чат "${chatName}"?`)) {
    return;
  }
  try {
    await axios.delete(`http://localhost:8081/chats/${numChatIdToDelete}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    chats.value = chats.value.filter(chat => chat.id !== numChatIdToDelete);
    if (selectedChatId.value === numChatIdToDelete) {
      selectedChatId.value = null;
      messages.value = [];
      currentChatUsers.value = [];
      typingUsers.value[String(numChatIdToDelete)] = []; // Очистити індикатори друку для видаленого чату
    }
  } catch (err) {
    console.error('CLIENT: Failed to delete chat:', err.response?.data || err.message);
    alert('Не вдалося видалити чат.');
  }
}

function formatTimestamp(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // Перевірка на валідну дату
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for formatting timestamp:', isoString);
      return 'невідомо';
    }
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.warn('Error formatting timestamp:', isoString, e);
    return 'невідомо';
  }
}

function getUserColor(username) {
  if (!username) return '#cccccc';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

</script>
<style scoped>
:root {
  --primary-glow-color: #00ffb2;
  --secondary-glow-color: #00ffff;
  --accent-glow-color: #f700ff;
  --danger-glow-color: #ff0044;
  --text-color: #e0e0e0; /* Трохи менш яскравий для основного тексту */
  --background-main-alpha: rgba(10, 25, 40, 0.85); /* Більш насичений фон */
  --background-sidebar-alpha: rgba(5, 15, 30, 0.9);
  --background-element-alpha: rgba(0, 255, 255, 0.08);
  --background-element-hover-alpha: rgba(0, 255, 255, 0.15);
  --border-color: var(--secondary-glow-color);
  --input-background: rgba(0, 0, 0, 0.2);
  --font-main: 'Roboto', 'Orbitron', sans-serif; /* Додано Roboto для читабельності */
  --font-display: 'Orbitron', sans-serif;
}

.chat-container {
  display: flex;
  height: 90vh; /* Збільшено висоту */
  max-height: 1000px; /* Максимальна висота для великих екранів */
  margin: 2rem auto; /* Центрування та відступи */
  width: 90%; /* Ширина контейнера */
  max-width: 1400px;
  background: var(--background-main-alpha);
  backdrop-filter: blur(12px) saturate(150%);
  color: var(--text-color);
  font-family: var(--font-main);
  border: 1px solid var(--border-color);
  border-radius: 12px; /* Більш плавні кути */
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.3), 0 0 15px var(--accent-glow-color) inset;
  overflow: hidden; /* Щоб backdrop-filter не виходив за межі */
}

.sidebar {
  width: 280px; /* Трохи ширше */
  background-color: var(--background-sidebar-alpha);
  padding: 1rem;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Відстань між секціями */
  transition: width 0.3s ease;
}

.sidebar-header {
  padding: 0.5rem 0;
}

.search-chat-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--input-background);
  border: 1px solid var(--border-color);
  color: var(--primary-glow-color);
  border-radius: 6px;
  font-family: var(--font-main);
  outline: none;
  transition: box-shadow 0.3s ease;
}
.search-chat-input:focus {
  box-shadow: 0 0 10px var(--primary-glow-color);
}


.chat-list-container, .user-list-container {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5rem; /* Для скролбару */
}

/* Кастомізація скролбару */
.chat-list-container::-webkit-scrollbar,
.user-list-container::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 8px;
}
.chat-list-container::-webkit-scrollbar-track,
.user-list-container::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.3);
  border-radius: 4px;
}
.chat-list-container::-webkit-scrollbar-thumb,
.user-list-container::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: var(--secondary-glow-color);
  border-radius: 4px;
  border: 1px solid var(--primary-glow-color);
}
.chat-list-container::-webkit-scrollbar-thumb:hover,
.user-list-container::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-glow-color);
}


.chat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Відстань між іконкою та текстом */
  padding: 0.85rem 0.75rem;
  margin-bottom: 0.5rem;
  background-color: var(--background-element-alpha);
  border: 1px solid transparent; /* Для плавності анімації */
  border-left: 3px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  position: relative; /* Для кнопки видалення */
}
.chat-item .chat-name {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-item:hover, .chat-item:focus {
  background-color: var(--background-element-hover-alpha);
  border-left-color: var(--primary-glow-color);
  outline: none; /* Для :focus */
}
.chat-item.active {
  background-color: rgba(255, 0, 255, 0.15);
  border-left-color: var(--accent-glow-color);
  box-shadow: 0 0 8px var(--accent-glow-color);
  color: var(--primary-glow-color);
}
.chat-icon {
  font-size: 1.2rem;
  color: var(--secondary-glow-color);
}
.chat-item.active .chat-icon {
  color: var(--accent-glow-color);
}
.sidebar .users-section .user-list-container {
  /* Можна додати прокрутку, якщо список довгий */
  max-height: 200px; /* Або інше значення */
  overflow-y: auto;
}

.status-indicator.offline {
  background-color: #777; /* Сірий для офлайн */
  box-shadow: none;
}

.chat-header .online-count {
  font-size: 0.9rem;
  color: var(--primary-glow-color);
  margin-left: auto; /* Розмістити справа */
  opacity: 0.8;
}

.typing-indicator-container {
  padding: 0.3rem 1.5rem;
  height: 25px; /* Фіксована висота, щоб не стрибав інтерфейс */
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.7);
  font-style: italic;
  text-align: left; /* Або center */
}
.typing-indicator-container span {
  display: inline-block;
  animation: blinkTyping 1.5s infinite;
}

@keyframes blinkTyping {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.delete-btn {
  background: transparent;
  border: none;
  color: var(--danger-glow-color);
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  opacity: 0.6; /* Приховано за замовчуванням */
  transition: opacity 0.2s ease, transform 0.2s ease;
  display: flex; /* Для центрування svg */
  align-items: center;
  justify-content: center;
}
.chat-item:hover .delete-btn, .chat-item:focus-within .delete-btn {
  opacity: 1; /* З'являється при наведенні на chat-item */
}
.delete-btn:hover, .delete-btn:focus {
  opacity: 1;
  transform: scale(1.1);
  color: #ff3377; /* Яскравіше при наведенні */
  outline: none;
}

.users-section-title {
  font-family: var(--font-display);
  color: var(--primary-glow-color);
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
  border-left: 3px solid var(--accent-glow-color);
  font-size: 1.1rem;
}

.user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.5rem;
  margin-bottom: 0.5rem;
  background: var(--background-element-alpha);
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: default; /* Якщо не інтерактивний */
  /* cursor: pointer; - якщо можна почати чат */
  transition: background-color 0.2s ease;
}
.user:hover {
  background-color: var(--background-element-hover-alpha);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #1a1a2e; /* Темний колір для тексту на світлому фоні аватара */
  font-family: var(--font-display);
  flex-shrink: 0; /* Щоб аватар не стискався */
}
.user-name {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}
.status-indicator { /* Цей клас поки не використовується для статусу онлайн/офлайн */
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: auto; /* Розмістити справа */
  box-shadow: 0 0 5px currentColor;
  flex-shrink: 0;
}
.status-indicator.online {
  background-color: var(--primary-glow-color);
  border: 1px solid rgba(0,0,0,0.5);
}
.status-indicator.offline { /* Приклад для офлайн */
  background-color: #555;
}
.no-users {
  padding: 1rem;
  text-align: center;
  font-style: italic;
  color: rgba(224, 224, 224, 0.6);
}


.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1); /* Злегка інший фон для контрасту */
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(0, 0, 0, 0.3);
}
.chat-header h3 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--primary-glow-color);
  font-size: 1.4rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* Відстань між повідомленнями */
}
.no-messages, .no-chat-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.1rem;
  color: rgba(224, 224, 224, 0.7);
  text-align: center;
}

.message-wrapper {
  display: flex;
  max-width: 75%; /* Повідомлення не на всю ширину */
  word-break: break-word; /* Перенос слів */
}
.message-wrapper.my-message {
  margin-left: auto; /* Вирівнювання своїх повідомлень праворуч */
  /* flex-direction: row-reverse; - Не потрібно, якщо текст всередині вирівнюється */
}

.message {
  padding: 0.75rem 1rem;
  background: var(--background-element-alpha);
  border-radius: 8px; /* Змінено на більш округлі */
  position: relative;
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid var(--secondary-glow-color);
}
.message-wrapper.my-message .message {
  background: rgba(0, 100, 150, 0.4); /* Інший колір для своїх повідомлень, трохи яскравіше */
  border-color: var(--primary-glow-color);
  color: #f0f0f0; /* Можливо, світліший текст для кращого контрасту на цьому фоні */
}

.author {
  font-weight: bold;
  color: var(--accent-glow-color);
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}
/* Немає потреби в .message-wrapper.my-message .author, якщо ми приховуємо для своїх */

.timestamp {
  display: block;
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.6);
  margin-top: 0.3rem;
  text-align: right;
}
/* .message-wrapper.my-message .timestamp { text-align: right; } - вже праворуч */


.input-area {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background-color: rgba(0,0,0,0.3);
}

.input-area input {
  flex: 1;
  padding: 0.85rem 1rem;
  background: var(--input-background);
  border: 1px solid var(--border-color);
  color: var(--primary-glow-color);
  border-radius: 6px;
  font-family: var(--font-main);
  font-size: 1rem;
  outline: none;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.input-area input:focus {
  border-color: var(--primary-glow-color);
  box-shadow: 0 0 12px var(--primary-glow-color);
}
.input-area input::placeholder {
  color: rgba(0, 255, 178, 0.5);
}

.input-area button {
  background: var(--primary-glow-color);
  color: #051014; /* Темний для контрасту з кнопкою */
  padding: 0.5rem; /* Зроблено квадратнішою для іконки */
  width: 50px; /* Фіксована ширина */
  height: 50px; /* Фіксована висота */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.input-area button:hover, .input-area button:focus {
  background: var(--secondary-glow-color);
  box-shadow: 0 0 10px var(--primary-glow-color);
}
.input-area button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.6;
}
.attach-file-btn {
  background: transparent;
  border: none;
  color: var(--primary-glow-color);
  padding: 0.5rem;
  width: 50px;
  height: 50px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.attach-file-btn:hover, .attach-file-btn:focus {
  color: var(--secondary-glow-color);
  background-color: rgba(0, 255, 255, 0.1);
  outline: none;
}

.message.message-type-image, .message.message-type-file {
  padding: 0.5rem; /* Менший падінг для контейнерів файлів */
}

.message-image-container, .message-file-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.message-image {
  max-width: 300px; /* Або інше значення */
  max-height: 250px;
  border-radius: 6px;
  cursor: pointer;
  object-fit: cover; /* Щоб зображення заповнювало контейнер */
  border: 1px solid var(--border-color);
}
.image-caption, .file-caption {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem; /* Падінг для тексту під файлом/зображенням */
  color: var(--text-color);
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(0, 255, 255, 0.05);
  border-radius: 6px;
  color: var(--primary-glow-color);
  text-decoration: none;
  border: 1px solid var(--secondary-glow-color);
  transition: background-color 0.2s ease;
}
.file-link:hover {
  background-color: rgba(0, 255, 255, 0.1);
}
.file-icon {
  flex-shrink: 0;
}
.file-name {
  word-break: break-all; /* Для довгих імен файлів */
}

.message-info {
  font-style: italic;
  color: rgba(224, 224, 224, 0.7);
  padding: 0.5rem;
  text-align: center;
  font-size: 0.85rem;
}

.file-preview-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.5rem;
  background-color: rgba(0,0,0,0.2);
  border-top: 1px solid var(--border-color);
}
.image-preview {
  max-height: 60px;
  max-width: 100px;
  border-radius: 4px;
  border: 1px solid var(--secondary-glow-color);
}
.file-info-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-color);
}
.file-icon-preview { color: var(--primary-glow-color); }

.clear-preview-btn {
  background: var(--danger-glow-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  margin-left: auto;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.clear-preview-btn:hover {
  opacity: 1;
}
.upload-progress-bar {
  height: 20px;
  background-color: rgba(0,0,0,0.3);
  border-top: 1px solid var(--border-color);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-color);
}
.upload-progress-bar .progress {
  height: 100%;
  background-color: var(--primary-glow-color);
  transition: width 0.1s linear;
  position: absolute;
  left:0; top:0;
  opacity: 0.3;
}
.upload-progress-bar span {
  position: relative; /* Щоб текст був поверх прогресу */
  z-index: 1;
  margin: auto;
}

</style>