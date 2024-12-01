import { createRouter, createWebHistory } from "vue-router"
import GraphView from "@views/CellView/GraphView.vue"
import MainPage from "@components/MainPage.vue"

const routes = [
    {
        path: '/main', component: MainPage
    },
    {
        path: '/graph', children: [
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