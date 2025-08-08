<template>
  <div
    class="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-xl shadow-sm relative overflow-hidden"
    :key="quoteKey"
  >
    <div class="relative z-10">
      <div class="h-28 flex flex-col justify-center">
        <p
          class="text-blue-700 dark:text-blue-300 font-medium text-lg"
          :class="{ 'quote-typing': isTyping }"
        >
          {{ displayedText }}
        </p>
      </div>
      <div
        class="flex justify-end mt-4 transition-opacity duration-500"
        :class="{ 'opacity-0': !authorVisible, 'opacity-100': authorVisible }"
      >
        <span class="text-blue-600 dark:text-blue-400 font-medium">— {{ quote.author }}</span>
      </div>
    </div>

    <IconButton
      @click="changeQuote"
      color="blue"
      class="absolute top-3 right-3"
      aria-label="Zmień cytat"
      size="sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </IconButton>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import IconButton from '@/components/base/IconButton.vue';

// Wszystkie cytaty
const quotes = [
  {
    text: 'Nie mogę zmienić kierunku wiatru, ale mogę tak ustawić żagle, by zawsze dotrzeć do celu',
    author: 'Jimmy Dean',
  },
  {
    text: 'To, co jest za nami, i to, co jest przed nami, to maleńkie sprawy w porównaniu z tym, co jest w nas',
    author: 'Ralph Waldo Emerson',
  },
  {
    text: 'Jeśli chcesz wieść szczęśliwe życie, przywiąż je do celu, a nie do ludzi czy rzeczy',
    author: 'Albert Einstein',
  },
  {
    text: 'Twój czas jest ograniczony, nie marnuj go, żyjąc życiem kogoś innego',
    author: 'Steve Jobs',
  },
  {
    text: 'Wszystko wydaje się niemożliwe, dopóki nie zostanie zrobione',
    author: 'Nelson Mandela',
  },
  {
    text: 'Nie oczekuj, że rzeczy się zmienią, jeśli ty nie zmienisz siebie',
    author: 'Albert Einstein',
  },
  {
    text: 'Nie narzekaj, że masz pod górę, gdy zmierzasz na szczyt',
    author: 'Konfucjusz',
  },
  {
    text: 'Najlepszym sposobem, by dowiedzieć się, czy możesz komuś zaufać, jest zaufać jemu samemu',
    author: 'Ernest Hemingway',
  },
  {
    text: 'Uwierz, że możesz, a jesteś w połowie drogi',
    author: 'Theodore Roosevelt',
  },
  {
    text: 'Nie możesz pomóc każdemu, ale każdy może pomóc komuś',
    author: 'Ronald Reagan',
  },
  {
    text: 'To, co jest za nami, i to, co jest przed nami, to maleńkie sprawy w porównaniu z tym, co jest w nas',
    author: 'Ralph Waldo Emerson',
  },
  {
    text: 'Jeśli chcesz wieść szczęśliwe życie, przywiąż je do celu, a nie do ludzi czy rzeczy',
    author: 'Albert Einstein',
  },
  {
    text: 'Twój czas jest ograniczony, nie marnuj go, żyjąc życiem kogoś innego',
    author: 'Steve Jobs',
  },
  {
    text: 'Życie jest tym, czym je tworzymy i jak je tworzymy - bez względu na to, czy zdajemy sobie z tego sprawę, czy nie.',
    author: 'Napoleon Hill',
  },
  {
    text: 'Najważniejszą rzeczą jest cieszyć się życiem - być szczęśliwym - tylko to się liczy',
    author: 'Dalai Lama',
  },
  {
    text: 'Żyje się tylko raz, ale jeśli zrobisz to dobrze, raz wystarczy',
    author: 'Mae West',
  },
  {
    text: 'Żyć to najrzadsza rzecz na świecie. Większość ludzi istnieje, to wszystko',
    author: 'Oscar Wilde',
  },
  {
    text: 'Celem naszego życia jest bycie szczęśliwym',
    author: 'Dalai Lama',
  },
  {
    text: 'Nie płacz, bo to już koniec, uśmiechaj się, bo to się wydarzyło',
    author: 'Dr Seuss',
  },
  {
    text: 'Nie możemy rozwiązywać problemów tym samym sposobem myślenia, którego używaliśmy, gdy je tworzyliśmy.',
    author: 'Albert Einstein',
  },
  {
    text: 'Ucz się, jakbyś miał żyć wiecznie, żyj, jakbyś miał umrzeć jutro.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Trzymaj się z dala od ludzi, którzy próbują umniejszać Twoje ambicje. Wąskie umysły zawsze to robią, ale wielcy ludzie sprawiają, że uwierzysz, iż i Ty możesz stać się wielkim.',
    author: 'Mark Twain',
  },
  {
    text: 'Zmieniając swoje myśli, pamiętaj, aby zmienić też swój świat.',
    author: 'Norman Vincent Peale',
  },
  {
    text: 'Dopiero kiedy podejmujemy ryzyko, nasze życie nabiera nowego wymiaru. Najtrudniejszym ryzykiem, które musimy podjąć, jest szczerość.',
    author: 'Walter Anderson',
  },
  {
    text: 'Natura dała nam wszystko, co potrzebne do osiągnięcia doskonałego zdrowia i dobrego samopoczucia, ale to od nas zależy, jak je ze sobą połączymy.',
    author: 'Diane McLaren',
  },
  {
    text: 'Nigdy nie rezygnuj z celu tylko dlatego, że osiągnięcie go wymaga czasu. Czas i tak upłynie',
    author: 'Earl Nightingale',
  },
  {
    text: 'Porażka to po prostu okazja, by zacząć jeszcze raz, tym razem mądrzej',
    author: 'Henry Ford',
  },
  {
    text: 'Nie czekaj. Pora nigdy nie będzie idealna',
    author: 'Napoleon Hill',
  },
  {
    text: 'To zawsze wydaje się niemożliwe, dopóki nie zostanie zrobione',
    author: 'Nelson Mandela',
  },
  {
    text: 'Nieważne, jak wolno idziesz, tak długo, jak się nie zatrzymujesz',
    author: 'Konfucjusz',
  },
  {
    text: 'Sukces to suma niewielkich wysiłków powtarzanych dzień po dniu',
    author: 'Robert Collier',
  },
  {
    text: 'Odwaga to nie brak strachu, ale działanie pomimo niego',
    author: 'Mark Twain',
  },
  {
    text: 'Nie musisz być wielki, żeby zacząć, ale musisz zacząć, żeby być wielkim',
    author: 'Les Brown',
  },
  {
    text: 'Jedyną granicą dla naszych osiągnięć jutra jest nasza wątpliwość dzisiaj. Rzuć sobie wyzwanie i zobacz, do czego jesteś zdolny',
    author: 'Franklin D. Roosevelt',
  },
  {
    text: 'Jeśli naprawdę chcesz coś zrobić, znajdziesz sposób. Jeśli nie, znajdziesz wymówkę',
    author: 'Jim Rohn',
  },
  {
    text: 'Życie to 10% tego, co ci się przydarza, i 90% tego, jak na to reagujesz',
    author: 'Charles R. Swindoll',
  },
  {
    text: 'W życiu nie chodzi o czekanie, aż burza minie. Chodzi o to, by nauczyć się tańczyć w deszczu',
    author: 'Vivian Green',
  },
  {
    text: 'Wielkie rzeczy nigdy nie pochodzą ze strefy komfortu',
    author: 'Roy T. Bennett',
  },
  {
    text: 'Kiedy napotykasz przeszkody, nie zmieniaj swoich celów – zmień swoje działania',
    author: 'Konfucjusz',
  },
  {
    text: 'Najlepszym czasem, żeby zacząć, jest teraz',
    author: 'Mark Twain',
  },
  {
    text: 'Jeśli kiedykolwiek zamierzasz cieszyć się życiem – teraz jest na to czas; nie jutro, nie za rok. Dzisiaj powinno być zawsze najwspanialszym dniem',
    author: 'Thomas Dreier',
  },
  {
    text: 'Nie masz wpływu na to, co ci się przydarza, ale masz wpływ na to, jak na to reagujesz',
    author: 'Epiktet',
  },
  {
    text: 'Nigdy nie jesteś zbyt stary na to, by zmienić cele lub marzyć nowe marzenia',
    author: 'C.S. Lewis',
  },
  {
    text: 'Sukces nie jest ostateczny, porażka nie jest fatalna. To odwaga, by kontynuować, jest tym, co się liczy',
    author: 'Winston S. Churchill',
  },
  {
    text: 'Nigdy nie bój się spróbować czegoś nowego. Pamiętaj, że arka została zbudowana przez amatorów, a Titanic przez profesjonalistów',
    author: 'autor nieznany',
  },
  {
    text: 'Nie oczekuj, że rzeczy się zmienią, jeśli ty nie zmienisz siebie',
    author: 'Albert Einstein',
  },
  {
    text: 'Nie narzekaj, że masz pod górę, gdy zmierzasz na szczyt',
    author: 'Konfucjusz',
  },
  {
    text: 'Wypełnij życie działaniem. Nie czekaj, aż coś się wydarzy. Spraw, by się wydarzyło',
    author: 'Bradley Whitford',
  },
  {
    text: 'Możesz pielęgnować swoje nieszczęście albo budować siłę. Wysiłek jest ten sam',
    author: 'Carlos Castaneda',
  },
  {
    text: 'Nie możesz przepłynąć morza, stojąc na brzegu i wpatrując się w wodę',
    author: 'Rabindranath Tagore',
  },
  {
    text: 'Różnica między niemożliwym a możliwym leży w ludzkiej determinacji',
    author: 'Tommy Lasorda',
  },
  {
    text: 'Od tego, jak spędzamy każdy dzień, zależy to, jak spędzamy całe życie',
    author: 'Regina Brett',
  },
  {
    text: 'Czy chciałbyś być człowiekiem, który ogląda, jak rzeczy się dzieją, czy człowiekiem, który sprawia, że rzeczy się dzieją?',
    author: 'Jim Lovell',
  },
];

// Stan cytatu
const quoteKey = ref(0);
const quote = ref(getRandomQuote());
const displayedText = ref('');
const authorVisible = ref(false);
const isTyping = ref(false);
const typingTimeout = ref(null);
const quoteInterval = ref(null);
const typingSpeed = 40; // ms per character

// Losowy cytat
function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Efekt pisania maszynowego
function typeWriter(text, index = 0) {
  isTyping.value = true;

  if (index < text.length) {
    displayedText.value = text.substring(0, index + 1);
    typingTimeout.value = setTimeout(() => {
      typeWriter(text, index + 1);
    }, typingSpeed);
  } else {
    // Zakończono pisanie
    isTyping.value = false;
    setTimeout(() => {
      authorVisible.value = true;
    }, 400);
  }
}

// Zmiana cytatu
function changeQuote() {
  // Resetowanie stanu
  authorVisible.value = false;

  // Wyczyszczenie timeoutów
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // Animacja znikania
  displayedText.value = '';
  quoteKey.value++; // Wymuszenie re-renderowania

  // Wybór nowego losowego cytatu (różnego od obecnego)
  let newQuote;
  do {
    newQuote = getRandomQuote();
  } while (newQuote.text === quote.value.text && quotes.length > 1);

  quote.value = newQuote;

  // Rozpoczęcie animacji pisania po krótkim opóźnieniu
  setTimeout(() => {
    typeWriter(quote.value.text);
  }, 300);
}

function startTypewriter() {
  displayedText.value = '';
  authorVisible.value = false;
  typeWriter(quote.value.text);
}

onMounted(() => {
  // Uruchomienie efektu pisania na starcie
  startTypewriter();

  // Ustawienie interwału zmiany co 30 sekund
  quoteInterval.value = setInterval(changeQuote, 30000);
});

onBeforeUnmount(() => {
  // Czyszczenie interwałów przed odmontowaniem
  clearInterval(quoteInterval.value);
  if (typingTimeout.value) clearTimeout(typingTimeout.value);
});
</script>

<style scoped>
.quote-typing::after {
  content: '|';
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Keyframe for card-enter animation */
@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Applying animations and pseudo-elements */
.quote-card {
  animation: card-enter 0.6s ease-out forwards;
}

.quote-card::before {
  content: '';
  position: absolute;
  top: -15%;
  right: -15%;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%);
  z-index: 0;
}

.quote-card::after {
  content: '';
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.05), transparent 70%);
  z-index: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .quote-text {
    font-size: 1.125rem; /* text-lg */
  }

  .min-h-\[150px\] {
    min-height: 150px;
  }

  .w-12.h-12 {
    width: 3rem; /* w-12 */
    height: 3rem; /* h-12 */
  }
}
</style>
