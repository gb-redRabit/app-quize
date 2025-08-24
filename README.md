<div align="center">
  <img src="https://raw.githubusercontent.com/gb-redRabit/app-quize/main/frontend/public/favicon.ico" alt="Quiz App Logo" width="128">
  <h1 align="center">Quiz App</h1>
</div>

<p align="center">
  Nowoczesna, skalowalna aplikacja quizowa zbudowana w oparciu o <b>Vue 3</b> (frontend) i <b>Node.js/Express</b> (backend). Umożliwia naukę, testowanie wiedzy, zarządzanie pytaniami i użytkownikami oraz zaawansowaną personalizację.
</p>

---

## ✨ Kluczowe Funkcje

- 🔐 **Autentykacja JWT**: Bezpieczna rejestracja i logowanie, automatyczne odświeżanie sesji.
- 📝 **Quiz i Egzamin**: Dwa tryby rozgrywki, timer, powtarzanie błędnych pytań.
- 📊 **Historia i Statystyki**: Szczegółowa historia quizów, analiza odpowiedzi, globalne statystyki z cache.
- 🎨 **Personalizacja**: Awatary, motywy, kolory, ukrywanie kategorii.
- 🛠️ **Panel Administracyjny**: CRUD pytań, import/eksport Excel, grupowa edycja, zarządzanie użytkownikami.
- 📚 **Wydajne listy**: Nieskończone przewijanie i szybkie renderowanie dużych kolekcji pytań dzięki [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller).
- ⚡ **Wysoka wydajność**: Kolejkowanie zapytań (Agenda), cache, limity, kompresja, rate limiting.
- 📱 **Responsywny UI**: Tailwind CSS, animacje, skeletony, przewodnik użytkownika.

---

## 🛠️ Technologie

| Warstwa       | Technologie                                                                               |
| :------------ | :---------------------------------------------------------------------------------------- |
| **Frontend**  | Vue 3, Vuex, Vue Router, Tailwind CSS, Axios, ExcelJS, vue-virtual-scroller               |
| **Backend**   | Node.js, Express, Mongoose, JWT, Bcrypt, ExcelJS, Multer, Agenda, compression, rate-limit |
| **Baza**      | MongoDB                                                                                   |
| **Narzędzia** | ESLint, Prettier, Nodemon, Vue CLI, dotenv                                                |

---

## 📂 Struktura Projektu

```
app-quize/
├── backend/
│   ├── src/
│   │   ├── app.js           # Serwer Express
│   │   ├── controllers/     # Logika biznesowa
│   │   ├── jobs/            # Kolejkowanie (Agenda)
│   │   ├── models/          # Schematy Mongoose
│   │   ├── routes/          # Endpointy API
│   │   └── utils/           # Cache, walidacje
│   └── importData.js        # Import danych
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios, cache
│   │   ├── components/      # Komponenty Vue
│   │   ├── router/          # Routing
│   │   ├── store/           # Vuex
│   │   ├── views/           # Widoki
│   │   └── composables/     # Logika reaktywna
│   └── vue.config.js
│
└── README.md
```

---

## ⚡ Instalacja i Uruchomienie

### Wymagania

- Node.js 18+
- npm
- MongoDB

### Krok po kroku

1. **Sklonuj repozytorium:**

   ```bash
   git clone https://github.com/gb-redRabit/app-quize.git
   cd app-quize
   ```

2. **Backend:**

   ```bash
   cd backend
   npm install
   # Skonfiguruj backend/.env (patrz poniżej)
   npm run dev
   ```

   Domyślnie: [http://localhost:3000](http://localhost:3000)

3. **Frontend:**

   ```bash
   cd ../frontend
   npm install
   # Skonfiguruj frontend/.env (patrz poniżej)
   npm run serve
   ```

   Domyślnie: [http://localhost:8080](http://localhost:8080)

4. **Pliki `.env`:**

   - `backend/.env`:
     ```env
     JWT_SECRET=twoj_super_tajny_klucz_jwt
     MONGO_URI=mongodb://localhost:27017/quizapp
     PORT=3000
     ```
   - `frontend/.env`:
     ```env
     VUE_APP_API_URL=http://localhost:3000/api
     ```

5. **Import przykładowych danych (opcjonalnie):**
   ```bash
   cd backend
   node importData.js
   ```

---

## 🔗 Najważniejsze Endpointy API

### Autoryzacja (`/api/auth`)

- `POST /register` – rejestracja
- `POST /login` – logowanie
- `POST /logout` – wylogowanie

### Pytania (`/api/questions`)

- `GET /` – pobierz pytania (paginacja, limity)
- `GET /search?query=...` – wyszukiwanie po ID/treści
- `GET /category/:category` – pytania z kategorii
- `POST /` – dodaj pytanie (autoryzacja)
- `PUT /:id` – edytuj pytanie (autoryzacja)
- `DELETE /:id` – usuń pytanie (autoryzacja)
- `GET /export/excel` – eksport do Excela (**bez kolejki**)
- `POST /import/excel` – import z Excela (autoryzacja)
- `POST /clear` – usuń wszystkie pytania (admin)
- `DELETE /category/:category` – usuń pytania z kategorii (admin)

### Użytkownicy (`/api/users`)

- `GET /me` – dane użytkownika
- `PUT /update-profile` – edycja profilu
- `GET /history` – historia quizów
- `GET /hquestion` – historia odpowiedzi
- `POST /hquestion` – zapis odpowiedzi
- `PUT /clear-category` – wyczyść odpowiedzi dla kategorii
- `GET /all` – lista użytkowników (admin)
- `PUT /:id/role` – zmiana roli (admin)

### Statystyki (`/api/stats`)

- `GET /` – globalne statystyki (cache)

---

## 🛡️ Bezpieczeństwo i optymalizacja

- **Rate limiting**: Ograniczenie żądań na IP (express-rate-limit)
- **Walidacja i sanityzacja**: Walidacja danych wejściowych
- **Limity na zapytania**: Maks. 500 rekordów na zapytanie
- **Kolejka zadań**: Agenda czyści wykonane zadania, nie trzyma dużych wyników w bazie
- **CORS**: Ograniczone do zaufanych domen
- **Kompresja**: Odpowiedzi HTTP kompresowane (gzip)
- **Cache**: Statystyki i wybrane zapytania cache'owane
- **vue-virtual-scroller**: Wydajne przewijanie dużych list pytań w frontendzie

---

## 👨‍💻 Autor

Projekt stworzony i rozwijany przez [Grzegorz](https://github.com/gb-redRabit).
