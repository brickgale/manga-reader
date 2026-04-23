import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import { Home, SearchResults, MangaInfo, ChapterReader, History, Bookmarks } from './views'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: 'Manga Reader' } },
    { path: '/search', component: SearchResults, meta: { title: 'Search | Manga Reader' } },
    { path: '/v/:id', component: MangaInfo },
    { path: '/v/:id/chapter/:chapterId', component: ChapterReader },
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
