import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import MangaReader from './views/MangaReader.vue'
import History from './views/History.vue'
import Bookmarks from './views/Bookmarks.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/manga/:id', component: MangaReader },
    { path: '/history', component: History },
    { path: '/bookmarks', component: Bookmarks },
  ],
})

createApp(App).use(router).mount('#app')
