import { createRouter, createWebHistory } from 'vue-router'
import db from '../firebase'

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import MovieDetail from '../views/MovieDetail.vue'
import Search from '../views/Search.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login, name: 'Login'},
  { path: '/movie/:id', component: MovieDetail, name: 'MovieDetail', props: true}, /* props: true per passare id come prop al componente MovieDetail */
  { path: '/search', component: Search, name: 'Search'},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  // se non sei loggato ti rimanda al login
  if (!defineBasicLoader.isAuthenticated() && to.name !== 'Login') {
    return { name: 'Login' }
  };
  // se sei loggato vai alla home
  if (db.isAuthenticated() && to.name === 'Login') {
    return { name: 'Home' }
  }
})

export default router