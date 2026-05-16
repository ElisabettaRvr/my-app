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
const recensioniAperte = ref(false)
const mostraTutti = ref(false)
const consigliatiVisibili = ref(6)

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGE5MTYwZjQ2MGE1ZjM5NmY5YzIyODVkNmJmNmZkNyIsIm5iZiI6MTc3ODU3NzkxOC4xNzcsInN1YiI6IjZhMDJmMWZlYzUzYjc1ZjAxMGUxNTUxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UBN5vY4IWlhbriLUUeJrQAoNIqXO3nMNs4odaBZbmuA'
const headers = { Authorization: `Bearer ${API_TOKEN}` }

onMounted(async () => {
  try {
    preferiti.value = await db.getPreferiti(username)
  } catch (e) {
    console.error('Errore preferiti:', e)
  }
  try {
    recensioni.value = await db.getRecensioniUtente(username)
  } catch (e) {
    console.error('Errore recensioni:', e)
  }
  try {
    await loadConsigliati()
  } catch (e) {
    console.error('Errore consigliati:', e)
  }
  loading.value = false
})

async function loadConsigliati() {
  const ids = [
    ...preferiti.value.map(p => p.movieId),
    ...recensioni.value.filter(r => r.voto >= 7).map(r => r.movieId)
  ]
  if (ids.length === 0) return

  const results = []
  for (const id of ids.slice(0, 3)) {
    const res = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/similar?language=it-IT&page=1`,
      { headers }
    )
    results.push(...res.data.results)
  }

  const seen = new Set([...ids])
  consigliati.value = results
    .filter(m => {
      if (seen.has(String(m.id))) return false
      seen.add(String(m.id))
      return m.poster_path
    })
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12)
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

    <!-- Le mie recensioni (accordion) -->
    <!-- Le mie recensioni (accordion) -->
<v-card class="mb-8" elevation="1" rounded="lg">
  <div
    class="d-flex align-center justify-space-between pa-4"
    style="cursor: pointer"
    @click="recensioniAperte = !recensioniAperte"
  >
    <span class="text-h6 font-weight-bold">📝 Le mie Recensioni ({{ recensioni.length }})</span>
    <v-icon>{{ recensioniAperte ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
  </div>

  <v-expand-transition>
    <div v-if="recensioniAperte">
      <v-divider />
      <div style="max-height: 300px; overflow-y: auto;" class="pa-4">

        <div v-if="recensioni.length === 0" class="text-medium-emphasis text-center py-4">
          Non hai ancora scritto recensioni.
        </div>

        <v-card
          v-for="rec in recensioni"
          :key="rec.id"
          class="mb-3"
          elevation="0"
          rounded="lg"
          color="grey-lighten-4"
          hover
          @click="goToMovie(rec.movieId)"
        >
          <div class="d-flex align-center" style="height: 80px; overflow: hidden;">
            <img
              :src="rec.poster_path
                ? `https://image.tmdb.org/t/p/w92${rec.poster_path}`
                : 'https://via.placeholder.com/54x80?text=N/D'"
              style="width: 54px; min-width: 54px; height: 80px; object-fit: cover; border-radius: 8px 0 0 8px;"
            />
            <div
              class="d-flex flex-column justify-space-between px-3 py-2"
              style="flex: 1; overflow: hidden;"
            >
              <div class="d-flex align-center justify-space-between gap-2">
                <span class="font-weight-bold text-body-2 text-truncate">{{ rec.movieTitle }}</span>
                <v-chip color="amber" size="x-small" class="flex-shrink-0">⭐ {{ rec.voto }}/10</v-chip>
              </div>
              <p
                class="text-caption text-medium-emphasis my-1"
                style="overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
              >
                {{ rec.testo }}
              </p>
              <span class="text-caption text-medium-emphasis">{{ formatData(rec.data) }}</span>
            </div>
          </div>
        </v-card>

      </div>
    </div>
  </v-expand-transition>
</v-card>

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
      <div class="text-h6 font-weight-bold mb-4">🎯 Consigliati per Te</div>
      <div v-if="consigliati.length === 0" class="text-medium-emphasis mb-4">
        Aggiungi preferiti o scrivi recensioni per ricevere consigli!
      </div>
      <v-row class="mb-4">
        <v-col
          v-for="film in consigliati.slice(0, consigliatiVisibili)"
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

      <!-- Bottone carica altro/mostra meno -->
      <div v-if="consigliati.length > 6" class="text-center mb-8">
        <v-btn
          variant="outlined"
          color="red-darken-4"
          @click="consigliatiVisibili = consigliatiVisibili === 6 ? 12 : 6"
        >
          {{ consigliatiVisibili === 6 ? 'Carica altri consigli' : 'Mostra meno' }}
        </v-btn>
      </div>

    </div>
  </div>
</template>