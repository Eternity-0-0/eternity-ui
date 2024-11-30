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
                path: ':graphName',
                component: GraphView,
                props: true
            }
        ]
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})