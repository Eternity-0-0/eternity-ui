import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import Material from '@primevue/themes/material';
import App from './App.vue'
import './main.css'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Material,
        options: {
            darkModeSelector: false,
        }
    }
});

app.mount('#app')
