import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// importare stili di vuetify, tutti i componenti, le direttive e le icone M<di
import 'vuetify/styles' 
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
}) /* per integrare componenti e direttive di vuetify */

// collega vuetify all'app vue
const app = createApp(App)

app.use(router)

app.mount('#app')
