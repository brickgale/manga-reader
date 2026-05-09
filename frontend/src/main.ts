import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import { Home, SearchResults, MangaInfo, Reader, History, Bookmarks } from './views'
import { APP_CONFIG } from './constants/app'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: APP_CONFIG.name } },
    { path: '/search', component: SearchResults, meta: { title: `Search | ${APP_CONFIG.name}` } },
    {
      path: '/manga/:id',
      redirect: to => {
        const chapterId = typeof to.query.chapter === 'string' ? to.query.chapter : undefined
        const page = typeof to.query.page === 'string' ? to.query.page : undefined
        return chapterId
          ? { path: `/v/${to.params.id}/chapter/${chapterId}`, query: page ? { page } : {} }
          : { path: `/v/${to.params.id}` }
      },
    },
    { path: '/v/:id', component: MangaInfo },
    { path: '/v/:id/chapter/:chapterId', component: Reader },
    {
      path: '/history',
      component: History,
      meta: { title: `Reading History | ${APP_CONFIG.name}` },
    },
    { path: '/bookmarks', component: Bookmarks, meta: { title: `Bookmarks | ${APP_CONFIG.name}` } },
  ],
})

router.afterEach(to => {
  const title = to.meta.title
  document.title = typeof title === 'string' && title.trim() !== '' ? title : APP_CONFIG.name
})

const pinia = createPinia()

createApp(App).use(pinia).use(router).mount('#app')
