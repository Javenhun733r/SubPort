<template>
  <div class="creator-card-link group">
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

      <div v-if="parsedSocials && parsedSocials.length > 0" class="social-icons-container">
        <a
            v-for="social in parsedSocials"
            :key="social.name"
            @click.stop="openSocialLink(social.link)"
            class="social-icon-link"
            :title="social.name"
            role="button" tabindex="0" style="cursor: pointer;"
        >
          <font-awesome-icon :icon="getIconProps(social.name)"/>
        </a>
      </div>
      <div v-else class="social-icons-placeholder"></div>

      <div class="button-container">
        <span
            @click="navigateToAuthor" class="cta-button-card-text"
            role="button" tabindex="0" style="cursor: pointer;">
          Переглянути профіль
          <svg xmlns="http://www.w3.org/2000/svg" class="button-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"/>
          </svg>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    creator: {
      type: Object,
      required: true
    }
  },
  computed: {
    parsedSocials() {

      if (!this.creator || !this.creator.socials) {
        return [];
      }

      let socialsToParse = this.creator.socials;

      if (typeof socialsToParse === 'string') {
        try {
          socialsToParse = JSON.parse(socialsToParse);
        } catch (e) {
          console.error(`[${this.creator.username}] Failed to parse creator.socials JSON string:`, e, this.creator.socials);
          return [];
        }
      }

      if (Array.isArray(socialsToParse)) {
        const validSocials = socialsToParse.filter(s => s && typeof s.name === 'string' && typeof s.link === 'string');
        if (validSocials.length !== socialsToParse.length) {

        }

        return validSocials;
      }

      console.warn(`[${this.creator.username}] creator.socials is not a string or array, or is malformed:`, this.creator.socials);
      return [];
    }
  },
  methods: {
    navigateToAuthor() {
      this.$router.push(`/author/${this.creator.username}`);
    },
    openSocialLink(url) {
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    getIconProps(socialNameInput) {
      const socialName = String(socialNameInput).toLowerCase();

      const icons = {
        youtube: ['fab', 'youtube'],
        telegram: ['fab', 'telegram-plane'],
        instagram: ['fab', 'instagram'],
        tiktok: ['fab', 'tiktok'],
        facebook: ['fab', 'facebook'],
        twitter: ['fab', 'x-twitter'],
        linkedin: ['fab', 'linkedin-in'],
        patreon: ['fab', 'patreon'],
        website: ['fas', 'globe'],
        github: ['fab', 'github'],
        twitch: ['fab', 'twitch'],
      };
      return icons[socialName] || ['fas', 'link'];
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
  height: 100%;
  background-color: rgba(35, 42, 66, 0.6);
  border: 1px solid rgba(0, 247, 255, 0.12);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out;
}

.creator-card-link:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 247, 255, 0.15);
  border-color: rgba(0, 247, 255, 0.3);
}

.creator-card-content {
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  position: relative;

}

.creator-card-header {
  margin-bottom: 1rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.avatar-image {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #00a1a8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.group:hover .avatar-image {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 247, 255, 0.2);
}

.creator-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.2rem;
  transition: color 0.3s ease;
  word-break: break-word;
}

.group:hover .creator-name {
  color: #00f7ff;
}

.creator-real-name {
  font-size: 0.8rem;
  color: #90a0b0;
  margin-bottom: 0.35rem;
  font-style: normal;
}

.creator-genre {
  font-size: 0.75rem;
  color: #7a8c9e;
  margin-bottom: 1.25rem;
  line-height: 1.5;
  min-height: 2.25em;
}

.social-icons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  margin-bottom: 1.25rem;
  min-height: 1.5rem;
}

.social-icons-placeholder {
  min-height: calc(1.5rem + 0.25rem + 1.25rem);
}

.social-icon-link i {
  font-size: 1rem;
  color: #7f9eb2;
  transition: color 0.25s ease, transform 0.25s ease;
}

.social-icon-link:hover i {
  color: #00e0e8;
  transform: translateY(-2px);
}

.button-container {
  margin-top: auto;
  width: 100%;
  padding-top: 0.5rem;
  display: flex;
  justify-content: center;
}

.cta-button-card-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0.6rem 0.85rem;
  background-color: rgba(0, 247, 255, 0.1);
  color: #00f7ff;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 6px;
  border: 1px solid rgba(0, 247, 255, 0.2);
  transition: all 0.3s ease;
}

.creator-card-link:hover .cta-button-card-text {
  background-color: rgba(0, 247, 255, 0.2);
  border-color: rgba(0, 247, 255, 0.4);
  color: #9effff;
  box-shadow: 0 2px 8px rgba(0, 247, 255, 0.1);
  transform: none;
}

.button-icon {
  width: 0.8rem;
  height: 0.8rem;
  margin-left: 0.25rem;
}
</style>