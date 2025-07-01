# Quiz App

Nowoczesna aplikacja quizowa zbudowana w oparciu o **Vue.js** (frontend) oraz **Node.js/Express** (backend). Pozwala na rozwiązywanie quizów, egzaminy, zarządzanie pytaniami, śledzenie historii użytkownika oraz posiada panel administracyjny.

---

## 🛠 Technologie

- **Frontend:** Vue 3, Vuex, Vue Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, JWT (autoryzacja), Body-Parser
- **Baza danych:** Pliki JSON (pytania, użytkownicy)
- **Inne:** RWD (responsywność), REST API, własny system autoryzacji

---

## 🚀 Funkcje

- Rejestracja i logowanie użytkowników
- Rozwiązywanie quizów i egzaminów z losowymi pytaniami
- Timer i automatyczne zakończenie testu po czasie
- Historia quizów i egzaminów użytkownika
- Panel użytkownika (zmiana motywu, zmiana hasła)
- Panel administracyjny do zarządzania pytaniami (CRUD, import/eksport Excel)
- Wyszukiwanie pytań po ID i treści
- Przeglądanie pytań wg kategorii
- Pobieranie pytań z kategorii do pliku TXT (do Worda)
- Nowoczesny, responsywny interfejs (mobile/desktop)
- Bezpieczna autoryzacja JWT

---

## 📁 Struktura projektu

```
app-quize
├── backend/
│   ├── data/
│   │   ├── data.json         # Pytania do quizów
│   │   └── users.json        # Użytkownicy i ich historia
│   ├── src/
│   │   ├── app.js            # Główny plik uruchamiający serwer
│   │   ├── controllers/      # Logika obsługi tras (usersController.js, questionsController.js, authController.js)
│   │   ├── middleware/       # Middleware (authMiddleware.js)
│   │   ├── routes/           # Definicje tras (users.js, questions.js, auth.js)
│   │   └── utils/            # Narzędzia (fileUtils.js, writeQueue.js)
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── tailwind.css
│   │   ├── components/
│   │   │   ├── Navbar.vue
│   │   │   ├── SearchBar.vue
│   │   │   ├── QuestionList.vue
│   │   │   ├── Timer.vue
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseModal.vue
│   │   │   ├── BaseLoader.vue
│   │   │   ├── BaseAlert.vue
│   │   │   ├── ProgressBar.vue
│   │   │   ├── SummaryBox.vue
│   │   │   └── ...
│   │   ├── views/
│   │   │   ├── Home.vue
│   │   │   ├── QuizView.vue
│   │   │   ├── ExamView.vue
│   │   │   ├── AdminView.vue
│   │   │   ├── CategoryQuestionsView.vue
│   │   │   ├── HistoryView.vue
│   │   │   ├── HistoryDetailsView.vue
│   │   │   ├── UserPanel.vue
│   │   │   ├── NotFound.vue
│   │   │   └── ...
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── randomQuestions.js
│   │   │   └── shuffleArray.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
└── README.md
```

---

## ⚡️ Szybki start

### Wymagania

- Node.js (v14+)
- npm

### Instalacja

1. Sklonuj repozytorium:

   ```bash
   git clone <repo-url>
   cd app-quize
   ```

2. Zainstaluj zależności backendu:

   ```bash
   cd backend
   npm install
   ```

3. Zainstaluj zależności frontendu:
   ```bash
   cd ../frontend
   npm install
   ```

### Uruchomienie

1. Uruchom backend:

   ```bash
   cd backend
   npm start
   # lub na dev:
   npm run dev
   ```

2. Uruchom frontend:

   ```bash
   cd frontend
   npm run serve
   ```

3. Otwórz [http://localhost:8080](http://localhost:8080) w przeglądarce.

---

## 🧑‍💻 Użytkowanie

- Zarejestruj się lub zaloguj, aby korzystać z quizów.
- Rozwiązuj quizy i egzaminy, przeglądaj statystyki i historię.
- Jako admin możesz dodawać, edytować i usuwać pytania oraz importować/eksportować je z/do Excela.
- Wyszukuj pytania po ID lub treści, przeglądaj wg kategorii.
- Pobieraj pytania z danej kategorii do pliku TXT (do Worda).
- Zmieniaj motyw aplikacji (jasny/ciemny) w panelu użytkownika.
- Zmieniaj hasło w panelu użytkownika.

---

## 📜 Licencja

MIT License

---
