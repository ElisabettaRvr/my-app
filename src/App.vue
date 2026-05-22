<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import db from '@/firebase'

const router = useRouter()
const drawer = ref(false) /* di base false, chiuso */
const searchQuery = ref('')
const authenticated = ref(db.isAuthenticated())

const theme = useTheme()
const user = db.getUser()
const isDark = ref(localStorage.getItem(`theme_${user}`) === 'dark')
theme.change(isDark.value ? 'dark' : 'light')

router.afterEach(() => {
  authenticated.value = db.isAuthenticated()
  drawer.value = false
  const currentUser = db.getUser()
  isDark.value = localStorage.getItem(`theme_${currentUser}`) === 'dark'
  theme.change(isDark.value ? 'dark' : 'light')
})

const genres = [
  { name: 'Azione', id: 28 },
  { name: 'Leggeri e Divertenti', id: 35 },
  { name: 'Commedia Romantica', id: 10749 },
  { name: 'Horror & Thriller', id: '27,53' },
  { name: 'Fantascienza', id: 878 },
  { name: 'Bambini & Famiglia', id: 10751 },
]

function toggleDark() {
  isDark.value = !isDark.value
  const currentUser = db.getUser()
  theme.change(isDark.value ? 'dark' : 'light')
  localStorage.setItem(`theme_${currentUser}`, isDark.value ? 'dark' : 'light')
}


// quando clicco un genere drawer si chiude e va alla pagina search
function goToGenre(genreId, genreName) {
  drawer.value = false
  router.push({ name: 'Search', query: { genreId: String(genreId), genreName } })
}

// prende testo nella barra e va alla pagina di search
function search() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'Search', query: { q: searchQuery.value.trim() } })
  searchQuery.value = ''
}

function logout() {
  if (confirm('Sei sicuro di voler uscire?')) {
    db.logout()
    router.push('/login')
  }
}
</script>

<template>
  <v-app>

    <!-- menu laterale che si apre con le 3 lineette -->
    <v-navigation-drawer v-if="authenticated" v-model="drawer" temporary>
      <v-list-item title="Generi" class="py-4" />
      <v-divider />
      <v-list density="compact" nav>
        <v-list-item v-for="genre in genres" :key="genre.id" :title="genre.name" prepend-icon="mdi-movie-outline"
          @click="goToGenre(genre.id, genre.name)" />
      </v-list>

      <template #append>
        <v-divider />
        <v-list-item title="Logout" prepend-icon="mdi-logout" @click="logout" class="mb-2 text-red" base-color="red" />
      </template>
    </v-navigation-drawer>

    <!-- barra rossa in alto con logo, ricerca e icona della home-->
    <v-app-bar color="red-darken-4" flat elevation="2">
      <v-app-bar-nav-icon v-if="authenticated" @click="drawer = !drawer" />

      <v-btn variant="text" color="white" to="/" class="text-h6 font-weight-bold navbar-btn">
        <v-icon class="mr-2">mdi-home</v-icon>
        MyMovies
      </v-btn>

      <v-spacer />

      <v-text-field v-if="authenticated" v-model="searchQuery" placeholder="Cerca film, regista, attore..."
        variant="solo-filled" density="compact" hide-details class="mx-4" style="max-width: 400px"
        append-inner-icon="mdi-magnify" @keyup.enter="search" @click:append-inner="search" />

      <v-btn v-if="authenticated" icon to="/profile" title="Profilo" class="navbar-btn">
        <v-icon>mdi-account</v-icon>
      </v-btn>

      <v-btn v-if="authenticated" variant="text" color="white"
        :aria-label="isDark ? 'Passa a Light Mode' : 'Passa a Dark Mode'" @click="toggleDark">
        <v-icon class="mr-1">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        {{ isDark ? 'Light Mode' : 'Dark Mode' }}
      </v-btn>
    </v-app-bar>

    <!--area principale dove vengono caricate le singole pagine-->
    <v-main role="main">
      <v-container fluid class="pa-6">
        <RouterView />
      </v-container>
    </v-main>

  </v-app>
</template>

<style scoped>
.navbar-btn {
  transition: background-color 0.2s;
}

.navbar-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

:focus-visible {
  outline: 3px solid white !important;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
