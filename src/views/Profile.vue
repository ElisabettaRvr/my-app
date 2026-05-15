<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import db from '@/firebase'

const router = useRouter()
const username = db.getUser()

const recensioni = ref([])
const preferiti = ref([])
const consigliati = ref([])
const loading = ref(true)

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGE5MTYwZjQ2MGE1ZjM5NmY5YzIyODVkNmJmNmZkNyIsIm5iZiI6MTc3ODU3NzkxOC4xNzcsInN1YiI6IjZhMDJmMWZlYzUzYjc1ZjAxMGUxNTUxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UBN5vY4IWlhbriLUUeJrQAoNIqXO3nMNs4odaBZbmuA'
const headers = { Authorization: `Bearer ${API_TOKEN}` }

onMounted(async () => {
  try {
    ;[recensioni.value, preferiti.value] = await Promise.all([
      db.getRecensioniUtente(username),
      db.getPreferiti(username)
    ])
    await loadConsigliati()
  } finally {
    loading.value = false
  }
})

async function loadConsigliati() {
  // Prende i movieId dai preferiti e dalle recensioni con voto >= 7
  const ids = [
    ...preferiti.value.map(p => p.movieId),
    ...recensioni.value.filter(r => r.voto >= 7).map(r => r.movieId)
  ]
  if (ids.length === 0) return

  // Prende film simili al primo preferito/recensito
  const res = await axios.get(
    `https://api.themoviedb.org/3/movie/${ids[0]}/similar?language=it-IT&page=1`,
    { headers }
  )
  consigliati.value = res.data.results.slice(0, 6)
}

function formatData(iso) {
  return iso ? new Date(iso).toLocaleDateString('it-IT') : ''
}

function goToMovie(id) {
  router.push(`/movie/${id}`)
}
</script>

<template>
  <div>
    <!-- Header profilo -->
    <div class="mb-8" style="display: flex; align-items: center; gap: 16px;">
    <v-icon size="56" color="red-darken-4">mdi-account-circle</v-icon>
    <div>
        <div class="text-h4 font-weight-bold">Il tuo Profilo</div>
        <div class="text-subtitle-1 text-medium-emphasis">{{ username }}</div>
    </div>
    </div>

    <v-skeleton-loader v-if="loading" type="article" />

    <div v-else>

      <!-- Preferiti -->
      <div class="text-h6 font-weight-bold mb-4">❤️ Film Preferiti ({{ preferiti.length }})</div>
      <div v-if="preferiti.length === 0" class="text-medium-emphasis mb-8">
        Non hai ancora aggiunto film ai preferiti.
      </div>
      <v-row class="mb-8">
        <v-col
          v-for="film in preferiti"
          :key="film.movieId"
          cols="6" sm="4" md="3" lg="2"
        >
          <v-card rounded="lg" elevation="2" hover @click="goToMovie(film.movieId)">
            <v-img
              :src="film.poster_path
                ? `https://image.tmdb.org/t/p/w342${film.poster_path}`
                : 'https://via.placeholder.com/342x513?text=No+Image'"
              height="200"
              cover
            />
            <v-card-title class="text-caption font-weight-bold text-truncate pa-2">
              {{ film.movieTitle }}
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>

      <!-- Consigliati -->
      <div v-if="consigliati.length > 0">
        <div class="text-h6 font-weight-bold mb-4">🎯 Consigliati per Te</div>
        <v-row class="mb-8">
          <v-col
            v-for="film in consigliati"
            :key="film.id"
            cols="6" sm="4" md="3" lg="2"
          >
            <v-card rounded="lg" elevation="2" hover @click="goToMovie(film.id)">
              <v-img
                :src="film.poster_path
                  ? `https://image.tmdb.org/t/p/w342${film.poster_path}`
                  : 'https://via.placeholder.com/342x513?text=No+Image'"
                height="200"
                cover
              />
              <v-card-title class="text-caption font-weight-bold text-truncate pa-2">
                {{ film.title }}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Storico recensioni -->
      <div class="text-h6 font-weight-bold mb-4">📝 Le tue Recensioni ({{ recensioni.length }})</div>
      <div v-if="recensioni.length === 0" class="text-medium-emphasis mb-8">
        Non hai ancora scritto recensioni.
      </div>
      <v-card
        v-for="rec in recensioni"
        :key="rec.id"
        class="mb-4"
        elevation="1"
        rounded="lg"
        hover
        @click="goToMovie(rec.movieId)"
      >
        <v-card-text>
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="font-weight-bold text-body-1">{{ rec.movieTitle }}</span>
            <div class="d-flex align-center gap-2">
              <v-chip color="amber" size="small">⭐ {{ rec.voto }}/10</v-chip>
              <span class="text-caption text-medium-emphasis">{{ formatData(rec.data) }}</span>
            </div>
          </div>
          <p class="text-body-2">{{ rec.testo }}</p>
        </v-card-text>
      </v-card>

    </div>
  </div>
</template>