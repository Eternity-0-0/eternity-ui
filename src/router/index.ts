import { createRouter, createWebHistory } from "vue-router"
import GraphView from "@/views/GraphView.vue"
import MainView from "@/views/MainView.vue"

const routes = [
    {
        path: '/main', component: MainView
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
    {
        path: '/wiki/:name',
        component: MainView,
        props: (route: { params: { name: string } }) => ({ name: route.params.name })
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})