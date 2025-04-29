
import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "@/components/Pages/WelcomePage.vue";
import LoginPage from "@/components/Pages/LoginPage.vue";
import SignUpPage from "@/components/Pages/SignUpPage.vue";
import AuthorPage from "@/components/Pages/AuthorPage.vue";
import MainPage from "@/components/Pages/MainPage.vue";
import AdminRequests from "@/components/Pages/AdminRequests.vue";
import AddAuthor from "@/components/Pages/AddAuthor.vue";
import ProfilePage from "@/components/Pages/ProfilePage.vue";
import ChatPage from "@/components/Pages/ChatPage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Welcome page",
            component: WelcomePage,
        },
        {
            path: "/signup",
            name: "SignUp page",
            component: SignUpPage,
        },
        {
            path: "/login",
            name: "Login page",
            component: LoginPage,
        },
        {
            path: '/author/:username',
            name: 'AuthorPage',
            component: () => import('@/components/Pages/AuthorPage.vue'),
            props: true
        },
        {
            path: "/main",
            name: "Main page",
            component: MainPage,
        },
        {
            path: "/requests_page",
            name: "Requests page",
            component: AdminRequests,
        },
        {
            path: '/add-author',
            name: 'add-author',
            component: AddAuthor
        },
        {
            path: '/profile',
            name: 'Profile page',
            component: ProfilePage,
        },
        {
            path: '/chat',
            name: 'ChatPage',
            component: ChatPage,
        }
    ],
});

export default router;
