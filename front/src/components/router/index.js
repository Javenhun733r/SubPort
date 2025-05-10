
import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "@/components/Pages/WelcomePage.vue";
import LoginPage from "@/components/Pages/LoginPage.vue";
import SignUpPage from "@/components/Pages/SignUpPage.vue";
import MainPage from "@/components/Pages/MainPage.vue";
import AdminRequests from "@/components/Pages/AdminRequests.vue";
import AddAuthor from "@/components/Pages/AddAuthor.vue";
import ProfilePage from "@/components/Pages/ProfilePage.vue";
import ChatPage from "@/components/Pages/ChatPage.vue";
import axios from "axios";
import EmailConfirmationPage from "@/components/Pages/EmailConfirmationPage.vue";
import ThanksView from "@/components/Pages/ThanksView.vue";
import ForgotPasswordPage from "@/components/Pages/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/components/Pages/ResetPasswordPage.vue";

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
            meta: { requiresAdmin: true },
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
        },
        {
            path: '/verify-email/:token',
            name: 'EmailVerification',
            component: EmailConfirmationPage,
        },
        {
            path: '/thanks',
            name: 'Thanks',
            component: ThanksView
        },
        {
            path: '/forgot-password',
            name: 'Forgot Password',
            component: ForgotPasswordPage,
        },
        {
            path: '/reset-password/:token',
            name: 'Reset Password',
            component: ResetPasswordPage,
        }
    ],
});
router.beforeEach(async (to, from, next) => {
    // Якщо маршрут вимагає адміністратора, перевіряємо роль
    if (to.meta.requiresAdmin) {
        const token = localStorage.getItem('jwt');

        if (!token) {
            // Якщо токен відсутній, редирект на сторінку логіну
            return next('/login');
        }

        try {
            const res = await axios.get('http://localhost:8081/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Перевіряємо роль користувача
            if (res.data.user?.role !== 'ADMIN') {
                return next('/main');  // Якщо користувач не адміністратор, редирект на сторінку без доступу
            }
        } catch (err) {
            console.error('Помилка при перевірці ролі:', err);
            return next('/login');
        }
    }
    next();
});

export default router;
