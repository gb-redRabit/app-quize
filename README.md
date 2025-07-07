<div align="center">
  <img src="https://via.placeholder.com/150/4FC08D/FFFFFF?text=QA" alt="Quiz App Logo" style="border-radius: 50%;">
  <h1>Quiz App</h1>
  <p>
    <strong>Nowoczesna aplikacja typu full-stack do quizów, zbudowana z Vue.js 3 i Node.js.</strong>
  </p>
  <p>
    <a href="https://github.com/gb-redRabit/app-quize/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js&style=flat-square" alt="Vue.js">
    <img src="https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&style=flat-square" alt="Node.js">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&style=flat-square" alt="Tailwind CSS">
  </p>
</div>

---

**Quiz App** to interaktywna platforma do nauki i testowania wiedzy. Umożliwia użytkownikom rozwiązywanie quizów i egzaminów, śledzenie postępów, a administratorom łatwe zarządzanie bazą pytań.

## ✨ Kluczowe Funkcje

- 🔐 **Pełna Autentykacja**: Bezpieczna rejestracja i logowanie użytkowników przy użyciu **JWT**.
- 📝 **Dynamiczne Quizy i Egzaminy**: Losowe pytania, różne tryby (nauka, egzamin) i kategorie.
- ⏱️ **Timer**: Ograniczenie czasowe dla egzaminów z automatycznym zakończeniem.
- 📊 **Śledzenie Postępów**: Szczegółowa historia rozwiązanych quizów i analiza wyników.
- 🎨 **Zaawansowana Personalizacja**: Użytkownicy mogą zmieniać swoje awatary, kolory interfejsu oraz motyw (jasny/ciemny).
- 🛠️ **Panel Administracyjny**: Kompleksowe zarządzanie pytaniami (CRUD) z funkcją importu/eksportu z plików **Excel**.
- 🔍 **Inteligentne Wyszukiwanie**: Filtrowanie pytań po ID, treści i kategoriach.
- 📱 **W Pełni Responsywny Interfejs**: Nowoczesny design, który świetnie wygląda na każdym urządzeniu.

## 🛠️ Stos Technologiczny

| Kategoria       | Technologia                                                                                                                                                                                         |
| :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | [Vue 3](https://vuejs.org/) (Composition API), [Vuex](https://vuex.vuejs.org/), [Vue Router](https://router.vuejs.org/), [Tailwind CSS](https://tailwindcss.com/), [Axios](https://axios-http.com/) |
| **Backend**     | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [JWT](https://jwt.io/), [ExcelJS](https://github.com/exceljs/exceljs)                                                            |
| **Baza Danych** | Pliki JSON (łatwa do migracji na np. MongoDB)                                                                                                                                                       |
| **Narzędzia**   | [ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [Nodemon](https://nodemon.io/)                                                                                                     |
|                 |

## 🚀 Szybki Start

### Wymagania Wstępne

- [Node.js](https://nodejs.org/) (zalecana wersja 18.x lub nowsza)
- [npm](https://www.npmjs.com/) (zazwyczaj instalowany z Node.js)

### Kroki Instalacji

1.  **Sklonuj repozytorium:**

    ```bash
    git clone https://github.com/gb-redRabit/app-quize.git
    cd app-quize
    ```

2.  **Zainstaluj zależności dla Backendu:**

    ```bash
    cd backend
    npm install
    ```

3.  **Zainstaluj zależności dla Frontendu:**
    ```bash
    cd ../frontend
    npm install
    ```

### Uruchomienie Aplikacji

Aplikację należy uruchomić w dwóch osobnych terminalach.

1.  **Uruchom serwer backendu (z katalogu `app-quize`):**

    ```bash
    cd backend
    npm run dev
    ```

    > Serwer będzie nasłuchiwał na porcie `3000`.

2.  **Uruchom aplikację frontendową (z katalogu `app-quize`):**
    ```bash
    cd frontend
    npm run serve
    ```
    > Aplikacja będzie dostępna pod adresem [http://localhost:8080](http://localhost:8080).

## 📂 Struktura Projektu

Projekt jest zorganizowany jako monorepo z dwoma głównymi katalogami: `frontend` i `backend`.

```
app-quize/
├── 📁 backend/
│   ├── 📁 data/              # Pliki JSON jako baza danych
│   ├── 📁 src/
│   │   ├── 📄 app.js         # Główny plik serwera Express
│   │   ├── 📁 controllers/  # Logika biznesowa
│   │   ├── 📁 middleware/   # Middleware (np. weryfikacja JWT)
│   │   └── 📁 routes/       # Definicje endpointów API
│   └── 📄 package.json
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📄 main.js        # Punkt wejściowy aplikacji Vue
│   │   ├── 📄 App.vue        # Główny komponent aplikacji
│   │   ├── 📁 assets/       # Style i zasoby statyczne
│   │   ├── 📁 components/   # Komponenty wielokrotnego użytku
│   │   ├── 📁 router/       # Konfiguracja Vue Router
│   │   ├── 📁 store/        # Moduły Vuex
│   │   └── 📁 views/        # Główne widoki stron
│   └── 📄 package.json
│
└── 📄 README.md             # Ten plik
```

## 📜 Licencja

Projekt jest udostępniony na licencji MIT[license.md]

---

<div align="center">
  Stworzone z ❤️ przez <a href="https://github.com/gb-redRabit">Grzegorza</a>
</div>
