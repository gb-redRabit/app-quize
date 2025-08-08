# Quiz App – Frontend

Nowoczesna, w pełni responsywna aplikacja quizowa zbudowana w oparciu o **Vue 3** i **Tailwind CSS**. Aplikacja oferuje zaawansowane funkcje, takie jak system egzaminów, personalizacja profilu, rozbudowany panel administracyjny oraz inteligentne mechanizmy optymalizacyjne.

---

## 🚀 Kluczowe Funkcje

### System Uwierzytelniania

- 🔐 Rejestracja i logowanie użytkowników z walidacją po stronie klienta i serwera.
- 🛡️ Obsługa tokenów **JWT** z automatycznym odświeżaniem w tle, aby zapobiec wylogowaniu w trakcie sesji.
- 🚪 Zabezpieczone trasy (navigation guards) dla zalogowanych użytkowników i administratorów.

### Quiz i Egzaminy

- 📝 Dwa tryby: **Quiz** (nauka z natychmiastową informacją zwrotną) i **Egzamin** (sprawdzian na czas).
- ⏱️ Wbudowany **timer** z automatycznym zakończeniem egzaminu po upływie czasu.
- 🔄 Możliwość powtarzania tylko pytań, na które odpowiedziano błędnie.
- 📊 Szczegółowe **podsumowanie wyników** po zakończeniu testu z wizualizacją postępów.

### Zarządzanie Pytaniami

- 📚 Przeglądanie wszystkich pytań z **nieskończonym przewijaniem** (`IntersectionObserver`).
- 🔍 Zaawansowane wyszukiwanie i filtrowanie pytań po ID, treści i kategorii.
- 🗂️ Widok pytań pogrupowanych według kategorii z możliwością sortowania i oznaczania.

### Panel Administratora

- 🛠️ Pełne zarządzanie pytaniami (**CRUD**).
- 🗂️ **Import i eksport pytań** z/do plików Excel (`.xlsx`).
- 👥 Zarządzanie użytkownikami i ich rolami (admin/user).
- ✍️ **Grupowa edycja pytań** na podstawie podanych ID (zmiana kategorii, opisu).
- 🗑️ Zarządzanie kategoriami, w tym usuwanie kategorii wraz ze wszystkimi przypisanymi do niej pytaniami.

### Panel Użytkownika i Personalizacja

- 🧑‍💻 Edycja profilu, bezpieczna zmiana hasła i ustawień.
- 🎨 Zaawansowana **personalizacja awatara** z wyborem stylu i koloru za pomocą interaktywnego koła barw (`<canvas>`).
- 🌙 Przełącznik motywu **jasny/ciemny** z zapamiętywaniem wyboru w `localStorage`.
- 🙈 Możliwość ukrywania niechcianych kategorii pytań na stronie głównej.

### Historia i Statystyki

- 📈 Śledzenie historii wszystkich rozwiązanych quizów i egzaminów.
- 📊 Szczegółowy podgląd każdej sesji z listą pytań i udzielonych odpowiedzi.
- 🗑️ Możliwość czyszczenia historii dla wybranej kategorii.

### UI/UX

- 📱 W pełni **responsywny interfejs** dostosowany do urządzeń mobilnych i desktopowych.
- 🧩 Interaktywny **przewodnik użytkownika** (`UserGuide.vue`) dla nowych osób.
- ⏳ Animowane **szkielety ładowania** (skeletons) dla lepszego wrażenia podczas ładowania danych.
- 💬 Globalny system alertów i powiadomień.
- ✨ Płynne animacje przejść i efekt "pisania na maszynie" dla cytatów.

---

## 🛠️ Technologie i Biblioteki

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Routing**: [Vue Router](https://router.vuejs.org/) (zabezpieczone trasy, dynamiczne importy)
- **Zarządzanie Stanem**: [Vuex](https://vuex.vuejs.org/) (modularna struktura)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (z wtyczkami `@tailwindcss/forms`, `@tailwindcss/typography`)
- **Komunikacja API**: [Axios](https://axios-http.com/) (z interceptorami, globalną obsługą błędów i cache'owaniem)
- **Narzędzia Budowania**: [Vue CLI](https://cli.vuejs.org/), Babel, PostCSS
- **Import/Eksport**: [ExcelJS](https://github.com/exceljs/exceljs)
- **Linting**: ESLint z konfiguracją dla Vue

---

## 📂 Struktura Projektu

Struktura katalogów jest zorganizowana w sposób modularny, aby ułatwić rozwój i utrzymanie aplikacji.

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/              # Konfiguracja Axios, interceptory, cache API
│   ├── assets/           # Globalne style, ikony, czcionki
│   ├── components/       # Komponenty wielokrotnego użytku (podział na base, layout, itp.)
│   ├── composables/      # Logika reaktywna wielokrotnego użytku (np. useQuestions)
│   ├── router/           # Konfiguracja routingu (podział na moduły: auth, admin, quiz)
│   ├── store/            # Moduły Vuex (user, questions, ui)
│   ├── utils/            # Funkcje pomocnicze
│   ├── views/            # Główne widoki aplikacji
│   ├── App.vue           # Główny komponent aplikacji
│   └── main.js           # Punkt wejściowy, inicjalizacja Vue i wtyczek
├── .env                  # Zmienne środowiskowe (np. VUE_APP_API_URL)
├── tailwind.config.js    # Konfiguracja Tailwind CSS
└── vue.config.js         # Konfiguracja Vue CLI (optymalizacja, PWA)
```

---

## ⚡ Instalacja i Uruchomienie

1.  **Sklonuj repozytorium** i przejdź do katalogu `frontend`.

2.  **Zainstaluj zależności**:

    ```bash
    npm install
    ```

3.  **Skonfiguruj zmienne środowiskowe**. Utwórz plik `.env` w głównym katalogu `frontend` i dodaj adres URL swojego backendu:

    ```
    VUE_APP_API_URL=http://localhost:3000/api
    ```

4.  **Uruchom serwer deweloperski**:

    ```bash
    npm run serve
    ```

    Aplikacja będzie dostępna pod adresem `http://localhost:8080`.

5.  **Zbuduj wersję produkcyjną**:
    ```bash
    npm run build
    ```
    Zoptymalizowane pliki zostaną umieszczone w katalogu `dist/`.

---

## ✨ Zaawansowane Mechanizmy

- **Inteligentne Cache'owanie API**: Zapytania `GET` są automatycznie cache'owane z konfigurowalnym czasem życia (TTL) dla różnych endpointów, co znacząco redukuje liczbę zapytań do serwera (`src/api/index.js`).
- **Optymalizacja Wydajności**: W `vue.config.js` skonfigurowano `splitChunks` do podziału kodu na mniejsze paczki oraz PWA z `workbox` do cachowania zasobów statycznych i zapytań API.
- **Globalna Obsługa Błędów**: Interceptory Axios centralnie obsługują błędy (np. 401, 404, 500), informując użytkownika za pomocą globalnego systemu alertów.
- **Automatyczne Odświeżanie Tokenu**: Aplikacja w tle odświeża token JWT, aby zapobiec wylogowaniu użytkownika w trakcie sesji (`src/main.js`).

---

## 👨‍💻 Autor

Projekt stworzony i rozwijany przez [Grzegorz](https://github.com/gb-redRabit).
