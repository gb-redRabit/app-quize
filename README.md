<div align="center">
  <img src="https://raw.githubusercontent.com/gb-redRabit/app-quize/main/frontend/public/favicon.ico" alt="Quiz App Logo" width="128">
  <h1 align="center">Quiz App</h1>
</div>

<p align="center">
  Nowoczesna, w pełni funkcjonalna aplikacja quizowa zbudowana w oparciu o Vue 3 i Node.js. Umożliwia użytkownikom naukę i testowanie wiedzy, a administratorom oferuje potężne narzędzia do zarządzania treścią.
</p>

---

## ✨ Kluczowe Funkcje

- 🔐 **Pełna Autentykacja**: Bezpieczna rejestracja i logowanie użytkowników przy użyciu **JWT** z automatycznym odświeżaniem sesji.
- 📝 **Dwa Tryby Rozgrywki**: Tryb **Quizu** do nauki z natychmiastową informacją zwrotną oraz tryb **Egzaminu** na czas.
- 📊 **Śledzenie Postępów**: Szczegółowa historia rozwiązanych testów oraz analiza poprawności odpowiedzi na poszczególne pytania.
- 🎨 **Zaawansowana Personalizacja**: Użytkownicy mogą zmieniać swoje awatary, kolory interfejsu oraz motyw (jasny/ciemny).
- 🛠️ **Rozbudowany Panel Administracyjny**:
  - Pełne zarządzanie pytaniami (CRUD).
  - Masowy **import i eksport** pytań z/do plików **Excel**.
  - **Grupowa edycja** pytań na podstawie podanych ID.
  - Zarządzanie użytkownikami i ich rolami.
- 📱 **W Pełni Responsywny Interfejs**: Nowoczesny design oparty na **Tailwind CSS**, który świetnie wygląda na każdym urządzeniu.
- ⚡ **Wysoka Wydajność**: Inteligentne cache'owanie zapytań API, kompresja odpowiedzi i optymalizacja ładowania zasobów.

---

## 🛠️ Stos Technologiczny

| Kategoria       | Technologia                                                             |
| :-------------- | :---------------------------------------------------------------------- |
| **Frontend**    | Vue 3 (Composition API), Vuex, Vue Router, Tailwind CSS, Axios, ExcelJS |
| **Backend**     | Node.js, Express, Mongoose, JWT, Bcrypt, ExcelJS, Multer                |
| **Baza Danych** | MongoDB                                                                 |
| **Narzędzia**   | ESLint, Prettier, Nodemon, Vue CLI                                      |

---

## 🚀 Szybki Start

### Wymagania Wstępne

- [Node.js](https://nodejs.org/) (wersja 18.x lub nowsza)
- [npm](https://www.npmjs.com/) (instalowany razem z Node.js)
- [MongoDB](https://www.mongodb.com/) (uruchomione lokalnie lub w chmurze)

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

4.  **Skonfiguruj pliki `.env`:**

    - Stwórz plik `backend/.env` i uzupełnij go:
      ```env
      JWT_SECRET=twoj_super_tajny_klucz_jwt_do_zmiany
      MONGO_URI=mongodb://localhost:27017/quizapp
      PORT=3000
      ```
    - Stwórz plik `frontend/.env` i uzupełnij go:

    ```env
    VUE_APP_API_URL=http://localhost:3000/api
    ```

5.  **Zaimportuj dane startowe (opcjonalnie):**
    W katalogu `backend` uruchom skrypt, aby wypełnić bazę danych przykładowymi pytaniami i użytkownikami.
    ```bash
    cd backend
    node importData.js
    ```

### Uruchomienie Aplikacji

Aplikację należy uruchomić w **dwóch osobnych terminalach**.

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

---

## 📂 Struktura Projektu

Projekt jest zorganizowany jako monorepo z dwoma głównymi katalogami: `frontend` i `backend`.

```
app-quize/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📄 app.js         # Główny plik serwera Express
│   │   ├── 📁 controllers/  # Logika biznesowa
│   │   ├── 📁 models/       # Schematy Mongoose
│   │   └── 📁 routes/       # Definicje endpointów API
│   └── 📄 importData.js     # Skrypt do importu danych
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📄 main.js        # Punkt wejściowy aplikacji Vue
│   │   ├── 📁 api/          # Konfiguracja Axios i cache
│   │   ├── 📁 components/   # Komponenty wielokrotnego użytku
│   │   ├── 📁 router/       # Konfiguracja Vue Router
│   │   ├── 📁 store/        # Moduły Vuex
│   │   └── 📁 views/        # Główne widoki stron
│   └── 📄 vue.config.js     # Konfiguracja Vue CLI
│
└── 📄 README.md             # Ten plik
```

---

## 🔗 Przykładowe Endpointy API

### Autoryzacja

- `POST /api/auth/register` – rejestracja użytkownika
- `POST /api/auth/login` – logowanie

### Pytania

- `GET /api/questions` – pobierz pytania z paginacją
- `POST /api/questions` – dodaj nowe pytanie
- `PUT /api/questions/:id` – edytuj istniejące pytanie
- `DELETE /api/questions/:id` – usuń pytanie
- `GET /api/questions/export/excel` – eksport pytań do pliku Excel
- `POST /api/questions/import/excel` – import pytań z pliku Excel

### Użytkownicy

- `GET /api/users/me` – pobierz dane zalogowanego użytkownika
- `PUT /api/users/update-profile` – aktualizuj profil (hasło, awatar, opcje)
- `GET /api/users/history` – pobierz historię quizów
- `PUT /api/users/:id/role` – zmiana roli użytkownika (tylko admin)

---

## 📜 Licencja

Projekt jest udostępniony na licencji MIT.

## 👨‍💻 Autor

Stworzone przez [Grzegorz](https://github.com/gb-redRabit).
