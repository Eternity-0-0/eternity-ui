import { createRouter, createWebHistory } from "vue-router"
import CellView from "@views/CellView/CellView.vue"
import GraphView from "@views/CellView/GraphView.vue"
import AppLayout from "@components/AppLayout/AppLayout.vue"

const routes = [
    {
        path: '/', component: AppLayout, children: [
            {
                path: '',
                component: CellView
            }
        ]
    },
    {
        path: '/graph', component: AppLayout, children: [
            {
                path: '/graph',
                component: GraphView
            }
        ]
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})