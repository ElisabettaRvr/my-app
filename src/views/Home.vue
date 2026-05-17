<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import MovieCard from '@/components/MovieCard.vue'

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGE5MTYwZjQ2MGE1ZjM5NmY5YzIyODVkNmJmNmZkNyIsIm5iZiI6MTc3ODU3NzkxOC4xNzcsInN1YiI6IjZhMDJmMWZlYzUzYjc1ZjAxMGUxNTUxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UBN5vY4IWlhbriLUUeJrQAoNIqXO3nMNs4odaBZbmuA'
const headers = { Authorization: `Bearer ${API_TOKEN}` }

const movies = ref([])
const loading = ref(true)
const sortBy = ref('popularity')

const sortOptions = [
  { title: 'Più Popolari',   value: 'popularity' },
  { title: 'Data di Uscita', value: 'release_date' },
  { title: 'Voto',           value: 'vote_average' }
]

onMounted(async () => {
  try {
    const res = await axios.get(
      'https://api.themoviedb.org/3/movie/now_playing?language=it-IT&page=1',
      { headers }
    )
    movies.value = res.data.results
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false // quando i dati sono arrivati, disabilita il caricamento
  }
})

const sortedMovies = computed(() => {
  return [...movies.value].sort((a, b) => {
    if (sortBy.value === 'release_date') return b.release_date?.localeCompare(a.release_date)
    if (sortBy.value === 'vote_average') return b.vote_average - a.vote_average
    return b.popularity - a.popularity
  })
})
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="text-h5 font-weight-bold">🎬 Film al Cinema</div>
        <div class="text-subtitle-2 text-medium-emphasis">I film in uscita adesso</div>
      </div>
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        label="Ordina per"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 200px"
      />
    </div>

    <v-row v-if="loading">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="movie in sortedMovies"
        :key="movie.id"
        cols="12" sm="6" md="4" lg="3" xl="2"
      >
        <MovieCard :movie="movie" />
      </v-col>
    </v-row>
  </div>
</template>