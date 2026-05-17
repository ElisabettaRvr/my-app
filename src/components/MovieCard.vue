<script setup>
import { ref, onMounted } from 'vue'
import db from '@/firebase'

const props = defineProps({
  movie: { type: Object, required: true }
})

const preferito = ref(false)
const inLista = ref(false)

onMounted(async () => {
  preferito.value = await db.isPreferito(props.movie.id)
  inLista.value = await db.isMiaLista(props.movie.id)
})

async function togglePreferito(e) {
  e.preventDefault()
  e.stopPropagation()
  if (preferito.value) {
    await db.removePreferito(props.movie.id)
    preferito.value = false
  } else {
    await db.addPreferito(props.movie.id, props.movie.title, props.movie.poster_path)
    preferito.value = true
  }
}

async function toggleLista(e) {
  e.preventDefault()
  e.stopPropagation()
  if (inLista.value) {
    await db.removeMiaLista(props.movie.id)
    inLista.value = false
  } else {
    await db.addMiaLista(props.movie.id, props.movie.title, props.movie.poster_path)
    inLista.value = true
  }
}

const genreMap = {
  28: 'Azione', 35: 'Commedia', 10749: 'Romantico', 53: 'Thriller',
  27: 'Horror', 10751: 'Famiglia', 99: 'Documentario', 18: 'Dramma',
  878: 'Fantascienza', 12: 'Avventura', 16: 'Animazione', 80: 'Crime',
  9648: 'Mistero', 10402: 'Musica', 36: 'Storia', 10752: 'Guerra'
}

function getGenre(movie) {
  if (!movie.genre_ids || movie.genre_ids.length === 0) return ''
  return genreMap[movie.genre_ids[0]] || ''
}
</script>

<template>
  <v-card
    :to="`/movie/${movie.id}`"
    height="400"
    rounded="lg"
    elevation="3"
    hover
    class="movie-card"
  >
    <v-img
        :src="movie.poster_path
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
            : 'https://via.placeholder.com/342x513?text=No+Image'"
        :alt="`Poster del film ${movie.title}`"
        height="280"
        cover
    />


    <v-card-title class="text-body-1 font-weight-bold text-truncate pt-3 pb-0">
      {{ movie.title }}
    </v-card-title>

    <v-card-subtitle class="pb-0">
      {{ movie.release_date?.slice(0, 4) || 'N/D' }}
      <span v-if="getGenre(movie)"> — {{ getGenre(movie) }}</span>
    </v-card-subtitle>

    <v-card-actions class="px-3 pb-2 pt-1">
      <v-chip color="amber" size="small" variant="tonal">
        ⭐ {{ movie.vote_average?.toFixed(1) }}
      </v-chip>
      <v-spacer />
      <v-btn
            :icon="inLista ? 'mdi-clock' : 'mdi-clock-outline'"
            :color="inLista ? 'blue-darken-2' : 'grey'"
            variant="text"
            size="small"
            class="icon-btn"
            :aria-label="inLista ? 'Rimuovi dalla lista' : 'Aggiungi alla lista'"
            @click="toggleLista"
        />
        <v-btn
            :icon="preferito ? 'mdi-heart' : 'mdi-heart-outline'"
            :color="preferito ? 'red' : 'grey'"
            variant="text"
            size="small"
            class="icon-btn"
            :aria-label="preferito ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'"
            @click="togglePreferito"
        />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.movie-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.movie-card:hover {
  transform: scale(1.03);
}
.icon-btn {
  transition: filter 0.2s;
}
.icon-btn:hover {
  filter: brightness(0.6);
}
</style>