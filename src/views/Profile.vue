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

  // Deduplica e rimuovi film già visti
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

            <!-- Preferiti -->
            <div class="text-h6 font-weight-bold mb-4">❤️ Film Preferiti ({{ preferiti.length }})</div>
            <div v-if="preferiti.length === 0" class="text-medium-emphasis mb-8">
                Non hai ancora aggiunto film ai preferiti.
            </div>
            <v-row class="mb-8">
                <v-col v-for="film in preferiti" :key="film.movieId" cols="6" sm="4" md="3" lg="2">
                    <v-card rounded="lg" elevation="2" hover @click="goToMovie(film.movieId)">
                        <v-img :src="film.poster_path
                            ? `https://image.tmdb.org/t/p/w342${film.poster_path}`
                            : 'https://via.placeholder.com/342x513?text=No+Image'" height="200" cover />
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
                    <v-col v-for="film in consigliati" :key="film.id" cols="6" sm="4" md="3" lg="2">
                        <v-card rounded="lg" elevation="2" hover @click="goToMovie(film.id)">
                            <v-img :src="film.poster_path
                                ? `https://image.tmdb.org/t/p/w342${film.poster_path}`
                                : 'https://via.placeholder.com/342x513?text=No+Image'" height="200" cover />
                            <v-card-title class="text-caption font-weight-bold text-truncate pa-2">
                                {{ film.title }}
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
            </div>

            <!-- Consigliati in base alle recensioni -->
            <div class="text-h6 font-weight-bold mb-4">🎯 Consigliati per Te</div>
            <div v-if="consigliati.length === 0" class="text-medium-emphasis mb-8">
                Aggiungi preferiti o scrivi recensioni per ricevere consigli!
            </div>
            <v-row class="mb-8">
                <v-col v-for="film in consigliati" :key="film.id" cols="6" sm="4" md="3" lg="2">
                    <v-card rounded="lg" elevation="2" hover @click="goToMovie(film.id)">
                        <v-img :src="film.poster_path
                            ? `https://image.tmdb.org/t/p/w342${film.poster_path}`
                            : 'https://via.placeholder.com/342x513?text=No+Image'" height="200" cover />
                        <v-card-title class="text-caption font-weight-bold text-truncate pa-2">
                            {{ film.title }}
                        </v-card-title>
                    </v-card>
                </v-col>
            </v-row>

        </div>
    </div>
</template>