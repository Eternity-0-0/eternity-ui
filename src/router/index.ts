import { createRouter, createWebHistory } from "vue-router"
import GraphView from "@/views/GraphView.vue"
import MainView from "@/views/MainView.vue"

const routes = [
    {
        path: '/main', 
        component: MainView
    },
    {
        path: '/:wikiName/:graphName',
        component: MainView,
        props: (route: { params: { wikiName: string, graphName: string } }) => ({ 
            wikiName: route.params.wikiName,
            graphName: route.params.graphName
        })
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})