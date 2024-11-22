import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const store = createPinia()

export function setupStore(app) {
    store.use(piniaPluginPersistedstate)
    app.use(store)
}

export { store }

export * from './uiSetting'
export * from './userStore'
export * from './uiHome'
