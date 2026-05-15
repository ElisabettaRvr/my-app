<script setup>
defineProps({
  movie: { type: Object, required: true }
})
</script>

<template>
  <v-card
    :to="`/movie/${movie.id}`"
    height="420"
    rounded="lg"
    elevation="3"
    hover
    class="movie-card"
  >
    <v-img
      :src="movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : 'https://via.placeholder.com/342x513?text=No+Image'"
      height="280"
      cover
    >
      <v-chip
        color="red-darken-4"
        size="small"
        class="ma-2"
        style="position:absolute; top:0; right:0"
      >
        ⭐ {{ movie.vote_average?.toFixed(1) }}
      </v-chip>
    </v-img>

    <v-card-title class="text-body-1 font-weight-bold text-truncate pt-3">
      {{ movie.title }}
    </v-card-title>

    <v-card-subtitle>
      {{ movie.release_date?.slice(0, 4) || 'N/D' }}
    </v-card-subtitle>

    <v-card-text class="text-caption" style="overflow:hidden; max-height:48px">
      {{ movie.overview?.slice(0, 80) }}{{ movie.overview?.length > 80 ? '...' : '' }}
    </v-card-text>
  </v-card>
</template>

<style scoped>
.movie-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.movie-card:hover {
  transform: translateY(-4px);
}
</style>