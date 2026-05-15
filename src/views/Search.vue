<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import MovieCard from '@/components/MovieCard.vue'

const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGE5MTYwZjQ2MGE1ZjM5NmY5YzIyODVkNmJmNmZkNyIsIm5iZiI6MTc3ODU3NzkxOC4xNzcsInN1YiI6IjZhMDJmMWZlYzUzYjc1ZjAxMGUxNTUxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UBN5vY4IWlhbriLUUeJrQAoNIqXO3nMNs4odaBZbmuA'
const headers = { Authorization: `Bearer ${API_TOKEN}` }

const route = useRoute()
const movies = ref([])
const loading = ref(false)
const pageTitle = ref('Risultati ricerca')

async function fetchByGenre(genreId, genreName) {
    loading.value = true
    pageTitle.value = `Genere: ${genreName}`
    try {
        const res = await axios.get(
            `https://api.themoviedb.org/3/discover/movie`,
            {
                headers,
                params: {
                    language: 'it-IT',
                    with_genres: genreId,
                    without_genres: genreId === '35' ? '27,53,18' : undefined,
                    sort_by: 'popularity.desc',
                }
            }
        )
        movies.value = res.data.results
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}
async function fetchByQuery(q) {
    loading.value = true
    pageTitle.value = `Risultati per: "${q}"`
    try {
        const [byTitle, byPerson] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/search/movie?language=it-IT&query=${encodeURIComponent(q)}`, { headers }),
            axios.get(`https://api.themoviedb.org/3/search/person?language=it-IT&query=${encodeURIComponent(q)}`, { headers })
        ])

        let results = [...byTitle.data.results]

        for (const person of byPerson.data.results.slice(0, 2)) {
            const filmRes = await axios.get(
                `https://api.themoviedb.org/3/person/${person.id}/movie_credits?language=it-IT`,
                { headers }
            )
            results = [...results, ...filmRes.data.cast, ...filmRes.data.crew]
        }

        const seen = new Set()
        movies.value = results.filter(m => {
            if (seen.has(m.id)) return false
            seen.add(m.id)
            return m.poster_path
        }).sort((a, b) => b.popularity - a.popularity)

    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

function load() {
    const { q, genreId, genreName } = route.query
    console.log('Query params:', route.query)
    if (genreId) fetchByGenre(genreId, genreName)
    else if (q) fetchByQuery(q)
}

onMounted(load)
watch(() => route.query, load)
</script>

<template>
    <div>
        <div class="text-h5 font-weight-bold mb-6">{{ pageTitle }}</div>

        <v-row v-if="loading">
            <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
                <v-skeleton-loader type="card" />
            </v-col>
        </v-row>

        <v-row v-else-if="movies.length">
            <v-col v-for="movie in movies" :key="movie.id" cols="12" sm="6" md="4" lg="3" xl="2">
                <MovieCard :movie="movie" />
            </v-col>
        </v-row>

        <v-empty-state v-else icon="mdi-movie-search" title="Nessun risultato trovato" />
    </div>
</template>