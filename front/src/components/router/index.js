
import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "@/components/Pages/WelcomePage.vue";
import LoginPage from "@/components/Pages/LoginPage.vue";
import SignUpPage from "@/components/Pages/SignUpPage.vue";
import ProfilePage from "@/components/Pages/ProfilePage.vue";
import MainPage from "@/components/Pages/MainPage.vue";

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
            path: "/profile",
            name: "Profile page",
            component: ProfilePage,
        },
        {
            path: "/main",
            name: "Main page",
            component: MainPage,
        },
    ],
});

export default router;
