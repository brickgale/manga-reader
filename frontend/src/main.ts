import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import SearchResults from './views/SearchResults.vue'
import MangaReader from './views/MangaReader.vue'
import History from './views/History.vue'
import Bookmarks from './views/Bookmarks.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: 'Manga Reader' } },
    { path: '/search', component: SearchResults, meta: { title: 'Search | Manga Reader' } },
    { path: '/manga/:id', component: MangaReader },
    { path: '/history', component: History, meta: { title: 'Reading History | Manga Reader' } },
    { path: '/bookmarks', component: Bookmarks, meta: { title: 'Bookmarks | Manga Reader' } },
  ],
})

router.afterEach(to => {
  const title = to.meta.title
  document.title = typeof title === 'string' && title.trim() !== '' ? title : 'Manga Reader'
})

const pinia = createPinia()

createApp(App).use(pinia).use(router).mount('#app')
