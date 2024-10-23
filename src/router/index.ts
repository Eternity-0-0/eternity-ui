import { createRouter, createWebHistory } from "vue-router"
import CellView from "../views/CellView/CellView.vue"
import AppLayout from "../components/AppLayout/AppLayout.vue"

const routes = [
    {
        path: '/', component: AppLayout, children: [
            {
                path: '',
                component: CellView
            }
        ]
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})