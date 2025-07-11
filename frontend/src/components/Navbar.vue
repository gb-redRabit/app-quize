<template>
  <div class="navbar-wrapper">
    <nav class="navbar">
      <!-- Logo i nazwa użytkownika -->
      <div class="navbar-brand">
        <div class="navbar-logo">
          <!-- Zamieniamy stały SVG na komponent Avatar -->
          <Avatar
            :avatar-index="getUser && getUser.avatar !== undefined ? getUser.avatar : 0"
            :color-index="getUser && getUser.avatarColors !== undefined ? getUser.avatarColors : 0"
            :size="32"
          />
        </div>
        <h1 class="navbar-username">
          {{ userName }}
        </h1>
      </div>

      <!-- Menu desktopowe -->
      <div class="navbar-menu desktop">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: $route.path === item.path }"
        >
          <i class="nav-icon" v-html="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </div>

      <!-- Przycisk wyloguj (desktop) -->
      <button @click="logout" class="logout-button desktop">
        <span>Wyloguj</span>
      </button>

      <!-- Hamburger (mobile) -->
      <button class="hamburger-button" @click="toggleMenu" aria-label="Otwórz menu">
        <div class="hamburger" :class="{ active: menuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </nav>

    <!-- Menu mobilne -->
    <transition name="mobile-menu">
      <div v-if="menuOpen" class="mobile-menu">
        <div class="mobile-menu-container">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="mobile-nav-link"
            :class="{ active: $route.path === item.path }"
            @click="closeMenu"
          >
            <i class="nav-icon" v-html="item.icon"></i>
            <span>{{ item.label }}</span>
          </router-link>

          <button @click="logout" class="mobile-logout-button">
            <span>Wyloguj</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay tła przy otwartym menu mobilnym -->
    <div v-if="menuOpen" class="mobile-overlay" @click="closeMenu"></div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Avatar from '@/components/Avatar.vue';

export default {
  components: {
    Avatar,
  },
  data() {
    return {
      menuOpen: false,
      navItems: [
        {
          path: '/',
          label: 'Strona główna',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>',
        },
        {
          path: '/history',
          label: 'Historia',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path></svg>',
        },
        {
          path: '/admin',
          label: 'Panel administracyjny',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"></path></svg>',
        },
        {
          path: '/user',
          label: 'Panel użytkownika',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>',
        },
      ],
    };
  },
  computed: {
    ...mapGetters('user', ['getUser', 'isAuthenticated']),
    userName() {
      return this.getUser && this.getUser.login ? this.getUser.login : 'nieznany';
    },
  },
  methods: {
    ...mapActions('user', ['login']),
    logout() {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      this.$store.dispatch('user/logout');
      this.$router.push({ name: 'Login' }).then(() => {
        window.location.reload();
      });
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      // Blokada przewijania strony gdy menu jest otwarte
      document.body.style.overflow = this.menuOpen ? 'hidden' : '';
    },
    closeMenu() {
      this.menuOpen = false;
      document.body.style.overflow = '';
    },
  },
  watch: {
    $route() {
      this.closeMenu();
    },
  },
  beforeUnmount() {
    // Upewnij się, że przewijanie zostanie odblokowane po zniszczeniu komponentu
    document.body.style.overflow = '';
  },
};
</script>

<style scoped>
.navbar-wrapper {
  width: 100%;
  position: relative;
  z-index: 50;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(to right, #ffffff, #f9fafb);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Dodajemy nowe style dla avatara w navbar */
.navbar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.15rem;
}

.navbar-username {
  font-weight: 600;
  color: #3b82f6;
  background: linear-gradient(45deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.125rem;
  letter-spacing: 0.025em;
  text-transform: capitalize;
}

.navbar-menu {
  display: none;
}

.navbar-menu.desktop {
  display: none;
}

@media (min-width: 768px) {
  .navbar-menu.desktop {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: #6b7280;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #1e40af;
  background-color: rgba(59, 130, 246, 0.1);
}

.nav-link.active {
  color: #3b82f6;
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  bottom: -0.25rem;
  height: 0.25rem;
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  border-radius: 9999px;
}

.nav-icon {
  display: flex;
  align-items: center;
}

.logout-button {
  display: none;
}

.logout-button.desktop {
  display: none;
}

@media (min-width: 768px) {
  .logout-button.desktop {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: linear-gradient(to right, #ef4444, #f87171);
    color: white;
    font-weight: 600;
    border-radius: 0.375rem;
    transition: all 0.3s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .logout-button:hover {
    background: linear-gradient(to right, #dc2626, #ef4444);
    box-shadow:
      0 4px 6px -1px rgba(239, 68, 68, 0.4),
      0 2px 4px -1px rgba(239, 68, 68, 0.2);
  }
}

/* Hamburger */
.hamburger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(59, 130, 246, 0.1);
  background-color: #fff;
  transition: all 0.2s ease;
}

.hamburger-button:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

@media (min-width: 768px) {
  .hamburger-button {
    display: none;
  }
}

.hamburger {
  position: relative;
  width: 24px;
  height: 20px;
}

.hamburger span {
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
  border-radius: 9999px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger span:first-child {
  top: 0;
}

.hamburger span:nth-child(2) {
  top: 9px;
}

.hamburger span:last-child {
  bottom: 0;
}

.hamburger.active span:first-child {
  transform: translateY(9px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:last-child {
  transform: translateY(-9px) rotate(-45deg);
}

/* Menu mobilne */
.mobile-menu {
  position: fixed;
  top: 4rem;
  left: 0;
  width: 100%;
  height: auto;
  max-height: calc(100vh - 4rem);
  background-color: white;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 40;
  overflow-y: auto;
  border-top: 1px solid rgba(209, 213, 219, 0.5);
}

.mobile-menu-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mobile-nav-link:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.mobile-nav-link.active {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
}

.mobile-logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(to right, #ef4444, #f87171);
  color: white;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.mobile-logout-button:hover {
  background: linear-gradient(to right, #dc2626, #ef4444);
}

.mobile-overlay {
  position: fixed;
  top: 4rem;
  left: 0;
  width: 100%;
  height: calc(100% - 4rem);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 30;
}

/* Animacje */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
