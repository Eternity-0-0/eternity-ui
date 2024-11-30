import { createRouter, createWebHistory } from "vue-router"
import GraphView from "@views/CellView/GraphView.vue"
import HexBackground from "@/components/HexBackground.vue"

const routes = [
    {
        path: '/main', component: HexBackground
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