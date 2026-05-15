<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import db from '@/firebase'

const props = defineProps({ id: { type: String, required: true } })

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGE5MTYwZjQ2MGE1ZjM5NmY5YzIyODVkNmJmNmZkNyIsIm5iZiI6MTc3ODU3NzkxOC4xNzcsInN1YiI6IjZhMDJmMWZlYzUzYjc1ZjAxMGUxNTUxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UBN5vY4IWlhbriLUUeJrQAoNIqXO3nMNs4odaBZbmuA'
const headers = { Authorization: `Bearer ${API_TOKEN}` }

const movie = ref(null)
const cast = ref([])
const recensioni = ref([])
const loading = ref(true)
const preferito = ref(false)

const newTesto = ref('')
const newVoto = ref(5)
const submitting = ref(false)
const snackbar = ref(false)
const snackMsg = ref('')

onMounted(async () => {
  try {
    const [mRes, cRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/movie/${props.id}?language=it-IT`, { headers }),
      axios.get(`https://api.themoviedb.org/3/movie/${props.id}/credits?language=it-IT`, { headers })
    ])
    movie.value = mRes.data
    cast.value = cRes.data.cast.slice(0, 8)
    preferito.value = await db.isPreferito(props.id)
    await loadRecensioni()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function togglePreferito() {
  if (preferito.value) {
    await db.removePreferito(props.id)
    preferito.value = false
    snackMsg.value = 'Rimosso dai preferiti'
  } else {
    await db.addPreferito(props.id, movie.value.title, movie.value.poster_path)
    preferito.value = true
    snackMsg.value = 'Aggiunto ai preferiti!'
  }
  snackbar.value = true
}

async function loadRecensioni() {
  recensioni.value = await db.getRecensioni(props.id)
}

async function submitRecensione() {
  if (!newTesto.value.trim()) return
  submitting.value = true
  try {
    await db.addRecensione(props.id, movie.value.title, newTesto.value.trim(), newVoto.value)
    newTesto.value = ''
    newVoto.value = 5
    await loadRecensioni()
    snackMsg.value = 'Recensione aggiunta!'
    snackbar.value = true
  } catch (e) {
    snackMsg.value = 'Errore: ' + e.message
    snackbar.value = true
  } finally {
    submitting.value = false
  }
}

function formatData(iso) {
  return iso ? new Date(iso).toLocaleDateString('it-IT') : ''
}
</script>

<template>
  <div>
    <v-skeleton-loader v-if="loading" type="article,card" />

    <div v-else-if="movie">

      <!-- Hero del film -->
      <v-row class="mb-6">
        <v-col cols="12" sm="3">
          <v-img
            :src="movie.poster_path
              ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
              : 'https://via.placeholder.com/342x513?text=No+Image'"
            rounded="lg"
            cover
          />
        </v-col>
        <v-col cols="12" sm="9">
          <div class="d-flex align-center justify-space-between mb-1">
            <div class="text-h4 font-weight-bold">{{ movie.title }}</div>
            <v-btn
              :icon="preferito ? 'mdi-heart' : 'mdi-heart-outline'"
              :color="preferito ? 'red' : 'grey'"
              variant="text"
              size="large"
              @click="togglePreferito"
            />
          </div>
          <div class="text-subtitle-1 text-medium-emphasis mb-3">
            {{ movie.release_date?.slice(0, 4) }} •
            {{ movie.runtime }} min •
            <span v-for="(g, index) in movie.genres" :key="g.id">
                {{ g.name }}
                <span v-if="index < movie.genres.length - 1"> / </span>
            </span>
          </div>
          <v-chip color="amber" class="mb-4">
            ⭐ {{ movie.vote_average?.toFixed(1) }} / 10
            ({{ movie.vote_count }} voti)
          </v-chip>
          <p class="text-body-1">{{ movie.overview }}</p>
        </v-col>
      </v-row>

      <!-- Cast -->
      <div class="text-h6 font-weight-bold mb-3">Cast Principale</div>
      <v-row class="mb-8">
        <v-col v-for="actor in cast" :key="actor.id" cols="6" sm="4" md="3" lg="2">
          <v-card rounded="lg" elevation="1">
            <v-img
              :src="actor.profile_path
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : 'https://via.placeholder.com/185x278?text=N/D'"
              height="160"
              cover
            />
            <v-card-text class="pa-2">
              <div class="text-caption font-weight-bold text-truncate">{{ actor.name }}</div>
              <div class="text-caption text-medium-emphasis text-truncate">{{ actor.character }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recensioni -->
      <v-divider class="mb-6" />
      <div class="text-h6 font-weight-bold mb-4">
        💬 Recensioni degli Utenti ({{ recensioni.length }})
      </div>

      <!-- Form nuova recensione -->
      <v-card class="mb-6 pa-4" elevation="2" rounded="lg">
        <div class="text-subtitle-1 font-weight-bold mb-3">Scrivi la tua recensione</div>
        <div class="d-flex align-center mb-2">
          <span class="mr-3 text-body-2">Il tuo voto:</span>
          <v-rating v-model="newVoto" color="amber" :length="10" density="compact" size="small" />
          <span class="ml-2 font-weight-bold">{{ newVoto }}/10</span>
        </div>
        <v-textarea
          v-model="newTesto"
          label="Scrivi la tua recensione..."
          variant="outlined"
          rows="3"
          hide-details
          class="mb-3"
        />
        <v-btn
          color="red-darken-4"
          :loading="submitting"
          :disabled="!newTesto.trim()"
          @click="submitRecensione"
        >
          Pubblica Recensione
        </v-btn>
      </v-card>

      <!-- Lista recensioni -->
      <div v-if="recensioni.length === 0" class="text-medium-emphasis text-center py-6">
        Ancora nessuna recensione. Sii il primo a scriverne una!
      </div>

      <v-card
        v-for="rec in recensioni"
        :key="rec.id"
        class="mb-4"
        elevation="1"
        rounded="lg"
      >
        <v-card-text>
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center gap-2">
              <v-icon color="red-darken-4">mdi-account-circle</v-icon>
              <span class="font-weight-bold">{{ rec.username }}</span>
            </div>
            <div class="d-flex align-center gap-2">
              <v-chip color="amber" size="small">⭐ {{ rec.voto }}/10</v-chip>
              <span class="text-caption text-medium-emphasis">{{ formatData(rec.data) }}</span>
            </div>
          </div>
          <p class="text-body-2 mt-1">{{ rec.testo }}</p>
        </v-card-text>
      </v-card>

    </div>
  </div>

  <v-snackbar v-model="snackbar" :timeout="3000">{{ snackMsg }}</v-snackbar>
</template>