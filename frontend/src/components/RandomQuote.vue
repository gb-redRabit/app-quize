<template>
  <div class="w-full py-4">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mx-auto relative overflow-hidden border"
    >
      <div class="pt-6 pb-2 px-4 min-h-[180px] flex flex-col justify-center">
        <blockquote
          class="text-gray-700 dark:text-gray-300 text-xl md:text-2xl text-center font-medium mb-8 relative z-10 leading-relaxed min-h-[3em]"
        >
          <span class="inline">{{ displayedText }}</span>
          <span
            class="inline-block w-[0.15em] h-[1.2em] bg-blue-500 ml-[0.1em] align-middle opacity-100"
            :class="{ 'animate-blink': isTyping }"
          ></span>
        </blockquote>

        <div class="flex flex-col items-center w-full">
          <div
            class="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-600 to-transparent mb-3"
          ></div>
          <div
            class="text-blue-600 dark:text-blue-400 font-medium text-lg opacity-0 transition-opacity duration-800 ease-in"
            :class="{ 'opacity-100': authorVisible }"
          >
            — {{ quote.author }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const quotes = [
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

export default {
  name: 'RandomQuote',
  data() {
    return {
      quote: quotes[Math.floor(Math.random() * quotes.length)],
      displayedText: '',
      typingSpeed: 30, // ms na znak
      quoteInterval: null,
      typingTimeout: null,
      quoteKey: 0,
      isTyping: false,
      authorVisible: false,
    };
  },
  methods: {
    // Efekt pisania maszynowego
    typeWriter(text, index = 0) {
      this.isTyping = true;

      if (index < text.length) {
        this.displayedText = text.substring(0, index + 1);
        this.typingTimeout = setTimeout(() => {
          this.typeWriter(text, index + 1);
        }, this.typingSpeed);
      } else {
        // Zakończono pisanie
        this.isTyping = false;
        setTimeout(() => {
          this.authorVisible = true;
        }, 400);
      }
    },

    // Zmiana cytatu
    changeQuote() {
      // Resetowanie stanu
      this.authorVisible = false;

      // Wyczyszczenie timeoutów
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Animacja znikania
      this.displayedText = '';
      this.quoteKey++; // Wymuszenie re-renderowania

      // Wybór nowego losowego cytatu (różnego od obecnego)
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * quotes.length);
      } while (quotes[newIndex].text === this.quote.text && quotes.length > 1);

      this.quote = quotes[newIndex];

      // Rozpoczęcie animacji pisania po krótkim opóźnieniu
      setTimeout(() => {
        this.typeWriter(this.quote.text);
      }, 300);
    },

    startTypewriter() {
      this.displayedText = '';
      this.authorVisible = false;
      this.typeWriter(this.quote.text);
    },
  },
  mounted() {
    // Uruchomienie efektu pisania na starcie
    this.startTypewriter();

    // Ustawienie interwału zmiany co 30 sekund
    this.quoteInterval = setInterval(this.changeQuote, 30000);
  },
  beforeUnmount() {
    // Czyszczenie interwałów przed odmontowaniem
    clearInterval(this.quoteInterval);
    clearTimeout(this.typingTimeout);
  },
};
</script>

<style scoped>
/* Keyframe for blink animation */
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
