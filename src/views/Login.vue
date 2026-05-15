<script setup>
import { ref } from 'vue'
import db from '@/firebase'
import router from '@/router'

const username = ref('')
const password = ref('')
const errore = ref('')
const loading = ref(false);
const showPassword = ref(false)

async function login() {
    if (!username.value || !password.value) {
        errore.value = 'Username e password obbligatori'
        return
    }
    loading.value = true
    errore.value = ''
    try {
        const user = await db.verificaLogin(username.value, password.value)
        db.setUser(user)
        router.push('/')
    } catch (e) {
        errore.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <v-container class="fill-height d-flex align-center justify-center">
        <v-sheet width="460" elevation="4" rounded="lg" class="pa-8">
            <div class="text-center mb-6">
                <div class="text-h4 font-weight-bold">🎬 MyMovies</div>
                <div class="text-subtitle-1 text-medium-emphasis">Accedi al tuo account</div>
            </div>
            <v-alert v-if="errore" type="error" class="mb-4" density="compact">
                {{ errore }}
            </v-alert>
            <v-text-field v-model.trim="username" label="Username" prepend-inner-icon="mdi-account" variant="outlined"
                :disabled="loading" class="mb-2" />
            <v-text-field v-model.trim="password" label="Password" :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined" :disabled="loading" class="mb-4"
                @click:append-inner="showPassword = !showPassword" />
            <v-btn color="red-darken-4" block size="large" :loading="loading" @click="login">
                Accedi
            </v-btn>
        </v-sheet>
    </v-container>
</template>