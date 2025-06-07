# Quiz App – Frontend

Nowoczesny frontend quizu oparty na **Vue 3** i **Tailwind CSS**.

---

## Funkcje

- Rejestracja i logowanie użytkowników
- Rozwiązywanie quizów i egzaminów z losowymi pytaniami
- Timer i automatyczne zakończenie testu po czasie
- Historia quizów i egzaminów użytkownika
- Panel administracyjny do zarządzania pytaniami (CRUD)
- Wyszukiwanie pytań po ID i treści
- Przeglądanie pytań wg kategorii
- Responsywny, nowoczesny interfejs (mobile/desktop)
- Własny system autoryzacji JWT

---

## Struktura katalogów

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── tailwind.css
│   ├── components/
│   │   ├── Navbar.vue
│   │   ├── SearchBar.vue
│   │   ├── QuestionList.vue
│   │   ├── Timer.vue
│   │   └── ...
│   ├── views/
│   │   ├── Home.vue
│   │   ├── QuizView.vue
│   │   ├── ExamView.vue
│   │   ├── AdminView.vue
│   │   ├── CategoryQuestionsView.vue
│   │   ├── HistoryView.vue
│   │   ├── HistoryDetailsView.vue
│   │   └── NotFound.vue
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   └── index.js
│   ├── utils/
│   │   └── randomQuestions.js
│   ├── App.vue
│   └── main.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── package-lock.json
└── README.md
```

---

## Instalacja i uruchomienie

1. Przejdź do katalogu frontend:

   ```bash
   cd frontend
   ```

2. Zainstaluj zależności:

   ```bash
   npm install
   ```

3. Uruchom aplikację:

   ```bash
   npm run serve
   ```

4. Otwórz [http://localhost:8080](http://localhost:8080) w przeglądarce.

---

## Najważniejsze pliki

- `src/views/` – główne widoki (QuizView, ExamView, AdminView, Home, Historia)
- `src/components/` – komponenty wielokrotnego użytku (QuestionList, SearchBar, Navbar, Timer)
- `src/store/` – Vuex store (stan aplikacji)
- `src/router/` – Vue Router (nawigacja)
- `src/assets/` – style globalne (Tailwind CSS)

---

## Użytkowanie

- Zarejestruj się lub zaloguj, aby korzystać z quizów.
- Rozwiązuj quizy i egzaminy, przeglądaj statystyki i historię.
- Jako admin możesz dodawać, edytować i usuwać pytania.
- Wyszukuj pytania po ID lub treści, przeglądaj wg kategorii.

---

## Licencja

MIT License
