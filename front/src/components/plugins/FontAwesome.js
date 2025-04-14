import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
    faXmark,
    faUser,
    faChevronRight,
    faChevronLeft,
    faFilter,
} from "@fortawesome/free-solid-svg-icons";
import {
    faYoutube,
    faTwitch,
    faInstagram,
    faTiktok
} from "@fortawesome/free-brands-svg-icons";

// Додавання всіх іконок у бібліотеку
library.add(
    faXmark,
    faUser,
    faChevronRight,
    faChevronLeft,
    faFilter,
    faYoutube,
    faTwitch,
    faInstagram,
    faTiktok
);

// Експортуємо компонент FontAwesomeIcon
export { FontAwesomeIcon };
