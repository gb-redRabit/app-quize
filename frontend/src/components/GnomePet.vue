<template>
  <div class="select-none flex flex-col items-center relative" :style="{ width: size + 'px' }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 428.796 428.796"
      :width="size"
      :height="size"
    >
      <!-- Lewa ręka (do animacji, obejmuje dłoń i ramię) -->
      <g :style="leftArmStyle">
        <!-- Lewa dłoń -->
        <circle fill="#f1c2b2" cx="137.698" cy="346.521" r="19.988" />
        <!-- Lewa ręka -->
        <path
          fill="#229cd2"
          d="M149.838,271.225c-17.745,0-32.129,14.385-32.129,32.129v43.167h40.229v-43.167h24.029 C181.968,285.61,167.583,271.225,149.838,271.225z"
        />
        <path
          opacity="0.3"
          fill="#222222"
          d="M149.838,271.225c-2.148,0-4.245,0.215-6.274,0.617 c-5.765,11.035-9.045,23.565-9.045,36.854v33.125c0,9.001,2.9,17.333,7.802,24.13c8.806-2.089,15.365-9.985,15.365-19.43h0.253 v-43.167h24.029C181.968,285.61,167.583,271.225,149.838,271.225z"
        />

        <path
          d="M 158.017 271.293 H 188.292 V 306.521 H 158.017 V 271.293 Z"
          style="fill: rgb(255, 255, 255)"
        ></path>
      </g>
      <!-- Prawa ręka -->
      <g>
        <circle fill="#f1c2b2" cx="291.099" cy="346.521" r="19.988" />
        <path
          fill="#229cd2"
          d="M278.957,271.225c17.745,0,32.13,14.385,32.13,32.129v43.167h-40.229v-43.167h-24.029 C246.829,285.61,261.214,271.225,278.957,271.225z"
        />
        <path
          opacity="0.3"
          fill="#222222"
          d="M278.957,271.225c2.148,0,4.245,0.215,6.274,0.617 c5.766,11.035,9.045,23.565,9.045,36.854v33.125c0,9.001-2.899,17.333-7.801,24.13c-8.807-2.089-15.365-9.985-15.365-19.43h-0.253 v-43.167h-24.029C246.829,285.61,261.214,271.225,278.957,271.225z"
        />

        <path
          d="M 240.583 269.784 H 270.858 V 305.012 H 240.583 V 269.784 Z"
          style="fill: rgb(255, 255, 255); stroke-width: 1"
        ></path>
      </g>
      <!-- Lewa stopa -->
      <g :style="leftLegStyle">
        <path
          fill="#ff495c"
          d="M161.324,403.669c-6.939,0-12.564,5.625-12.564,12.564c0,6.938,5.625,12.563,12.564,12.563h30.983 c4.981,0,9.02-4.039,9.02-9.02v-16.107H161.324z"
        />
        <rect x="171.409" y="355.4" fill="#333e48" width="29.918" height="48.269" />
        <rect x="171.409" y="355.4" opacity="0.5" fill="#222222" width="29.918" height="30.331" />
      </g>
      <!-- Prawa stopa -->
      <g :style="rightLegStyle">
        <path
          fill="#ff495c"
          d="M267.474,403.669c6.938,0,12.563,5.625,12.563,12.564c0,6.938-5.625,12.563-12.563,12.563h-30.984 c-4.981,0-9.02-4.039-9.02-9.02v-16.107H267.474z"
        />
        <rect x="227.469" y="355.4" fill="#333e48" width="29.918" height="48.269" />
        <rect x="227.469" y="355.4" opacity="0.5" fill="#222222" width="29.918" height="30.331" />
      </g>
      <!-- Tułów, broda, czapka, twarz -->
      <g>
        <!-- Tułów -->
        <path
          fill="#229cd2"
          d="M214.398,236.735c-39.742,0-71.96,32.218-71.96,71.96v33.125h143.92v-33.125 C286.358,268.953,254.14,236.735,214.398,236.735z"
        />
        <path
          opacity="0.2"
          fill="#222222"
          d="M214.398,236.735c-35.081,0-64.285,25.111-70.655,58.335 c17.405,19.314,42.609,31.462,70.655,31.462c28.047,0,53.25-12.148,70.655-31.462 C278.683,261.846,249.481,236.735,214.398,236.735z"
        />
        <path
          fill="#333e48"
          d="M286.358,341.82c0,18.465-14.969,33.435-33.434,33.435h-77.052 c-18.465,0-33.434-14.97-33.434-33.435H286.358z"
        />
        <!-- Twarz -->
        <circle fill="#f1c2b2" cx="214.398" cy="181.18" r="92.262" />
        <!-- Broda -->
        <path
          fill="#985f35"
          d="M280.635,147.995v54.173c-1.037-0.083-2.081-0.139-3.14-0.139c-11.83,0-22.418,5.281-29.56,13.607 c-3.718-0.975-7.62-1.499-11.643-1.499c-7.931,0-15.39,2.019-21.895,5.567c-6.504-3.549-13.963-5.567-21.894-5.567 c-4.024,0-7.924,0.524-11.644,1.499c-7.141-8.326-17.73-13.607-29.558-13.607c-1.059,0-2.104,0.056-3.142,0.139v-54.173h-28.853 v75.924c0,52.517,42.574,95.09,95.09,95.09c52.518,0,95.09-42.573,95.09-95.09v-75.924H280.635z"
        />
        <path
          opacity="0.2"
          fill="#222222"
          d="M142.132,123.861c-5.748,7.242-10.437,15.363-13.821,24.134h-9.003v75.924 c0,52.517,42.574,95.09,95.09,95.09V123.861H142.132z"
        />
        <ellipse
          :style="rightEyelidStyle"
          :cx="262.785"
          :cy="185.958"
          rx="24.797"
          ry="24.797"
          fill="#f1c2b2"
          opacity="0.95"
        />
        <!-- Oczy -->
        <circle fill="#fff" cx="262.785" cy="185.958" r="24.797" />
        <circle fill="#333e48" cx="262.785" cy="185.958" r="10.858" />
        <!-- Powieka prawa -->
        <ellipse
          :style="rightEyelidStyle"
          :cx="262.785"
          :cy="185.958"
          rx="24.797"
          ry="24.797"
          fill="#f1c2b2"
          opacity="0.95"
        />
        <circle fill="#fff" cx="166.011" cy="185.958" r="24.797" />
        <circle fill="#333e48" cx="166.011" cy="185.958" r="10.858" />
        <!-- Powieka lewa -->
        <ellipse
          :style="leftEyelidStyle"
          :cx="166.011"
          :cy="185.958"
          rx="24.797"
          ry="24.797"
          fill="#f1c2b2"
          opacity="0.95"
        />
        <!-- Czapka -->
        <path
          fill="#ff5959"
          d="M311.681,120.879L242.856,16.296c-0.57-0.97-1.186-1.909-1.85-2.811l-0.001,0 C234.999,5.309,225.32,0,214.398,0c-10.921,0-20.601,5.309-26.607,13.484v0c-0.664,0.903-1.28,1.842-1.85,2.811l-68.825,104.584 c-4.957,5.773-7.959,13.274-7.959,21.48c0,18.227,14.776,33.002,33.002,33.002h144.478c18.227,0,33.002-14.775,33.002-33.002 C319.639,134.153,316.638,126.652,311.681,120.879z"
        />
        <path
          opacity="0.3"
          fill="#222222"
          d="M187.79,13.484L187.79,13.484c-0.664,0.903-1.28,1.842-1.85,2.812l-68.825,104.584 c-4.957,5.773-7.959,13.274-7.959,21.48c0,18.227,14.776,33.002,33.002,33.002h72.239V0C203.477,0,193.797,5.309,187.79,13.484z"
        />

        <!-- Usta -->
        <path
          fill="#6b3f23"
          d="M168.958,223.51c0,25.096,20.344,45.44,45.44,45.44s45.44-20.344,45.44-45.44H168.958z"
          :style="mouthStyle"
        />
        <!-- Nos -->
        <path
          fill="#ff637d"
          d="M226.466,200.461c-1.969-4.726-6.629-8.049-12.068-8.049c-5.439,0-10.1,3.324-12.068,8.049 c-6.099,0.292-10.958,5.314-10.958,11.486c0,12.717,10.31,23.026,23.026,23.026c12.717,0,23.027-10.31,23.027-23.026 C237.425,205.776,232.566,200.753,226.466,200.461z"
        />
        <!-- Język -->
        <path
          fill="#ff8f9c"
          d="M214.398,249.593c-10.947,0-21.211,2.9-30.092,7.952c8.016,7.093,18.547,11.405,30.092,11.405 c11.545,0,22.078-4.313,30.092-11.405C235.61,252.493,225.345,249.593,214.398,249.593z"
          :style="tongueStyle"
        />
      </g>
      <g :style="walkStyle">
        <!-- Lewa ręka (do animacji, obejmuje dłoń i ramię) -->
        <g :style="leftArmStyle">
          <!-- Lewa dłoń -->
          <circle fill="#f1c2b2" cx="137.698" cy="346.521" r="19.988" />
          <!-- Lewa ręka -->
          <path
            fill="#229cd2"
            d="M149.838,271.225c-17.745,0-32.129,14.385-32.129,32.129v43.167h40.229v-43.167h24.029 C181.968,285.61,167.583,271.225,149.838,271.225z"
          />
          <path
            opacity="0.3"
            fill="#222222"
            d="M149.838,271.225c-2.148,0-4.245,0.215-6.274,0.617 c-5.765,11.035-9.045,23.565-9.045,36.854v33.125c0,9.001,2.9,17.333,7.802,24.13c8.806-2.089,15.365-9.985,15.365-19.43h0.253 v-43.167h24.029C181.968,285.61,167.583,271.225,149.838,271.225z"
          />

          <path
            d="M 158.017 271.293 H 188.292 V 306.521 H 158.017 V 271.293 Z"
            style="fill: rgb(255, 255, 255)"
          ></path>
        </g>
        <!-- Prawa ręka -->
        <g>
          <circle fill="#f1c2b2" cx="291.099" cy="346.521" r="19.988" />
          <path
            fill="#229cd2"
            d="M278.957,271.225c17.745,0,32.13,14.385,32.13,32.129v43.167h-40.229v-43.167h-24.029 C246.829,285.61,261.214,271.225,278.957,271.225z"
          />
          <path
            opacity="0.3"
            fill="#222222"
            d="M278.957,271.225c2.148,0,4.245,0.215,6.274,0.617 c5.766,11.035,9.045,23.565,9.045,36.854v33.125c0,9.001-2.899,17.333-7.801,24.13c-8.807-2.089-15.365-9.985-15.365-19.43h-0.253 v-43.167h-24.029C246.829,285.61,261.214,271.225,278.957,271.225z"
          />

          <path
            d="M 240.583 269.784 H 270.858 V 305.012 H 240.583 V 269.784 Z"
            style="fill: rgb(255, 255, 255); stroke-width: 1"
          ></path>
        </g>
        <!-- Lewa stopa -->
        <g :style="leftLegStyle">
          <path
            fill="#ff495c"
            d="M161.324,403.669c-6.939,0-12.564,5.625-12.564,12.564c0,6.938,5.625,12.563,12.564,12.563h30.983 c4.981,0,9.02-4.039,9.02-9.02v-16.107H161.324z"
          />
          <rect x="171.409" y="355.4" fill="#333e48" width="29.918" height="48.269" />
          <rect x="171.409" y="355.4" opacity="0.5" fill="#222222" width="29.918" height="30.331" />
        </g>
        <!-- Prawa stopa -->
        <g :style="rightLegStyle">
          <path
            fill="#ff495c"
            d="M267.474,403.669c6.938,0,12.563,5.625,12.563,12.564c0,6.938-5.625,12.563-12.563,12.563h-30.984 c-4.981,0-9.02-4.039-9.02-9.02v-16.107H267.474z"
          />
          <rect x="227.469" y="355.4" fill="#333e48" width="29.918" height="48.269" />
          <rect x="227.469" y="355.4" opacity="0.5" fill="#222222" width="29.918" height="30.331" />
        </g>
        <!-- Tułów, broda, czapka, twarz -->
        <g>
          <!-- Tułów -->
          <path
            fill="#229cd2"
            d="M214.398,236.735c-39.742,0-71.96,32.218-71.96,71.96v33.125h143.92v-33.125 C286.358,268.953,254.14,236.735,214.398,236.735z"
          />
          <path
            opacity="0.2"
            fill="#222222"
            d="M214.398,236.735c-35.081,0-64.285,25.111-70.655,58.335 c17.405,19.314,42.609,31.462,70.655,31.462c28.047,0,53.25-12.148,70.655-31.462 C278.683,261.846,249.481,236.735,214.398,236.735z"
          />
          <path
            fill="#333e48"
            d="M286.358,341.82c0,18.465-14.969,33.435-33.434,33.435h-77.052 c-18.465,0-33.434-14.97-33.434-33.435H286.358z"
          />
          <!-- Twarz -->
          <circle fill="#f1c2b2" cx="214.398" cy="181.18" r="92.262" />
          <!-- Broda -->
          <path
            fill="#985f35"
            d="M280.635,147.995v54.173c-1.037-0.083-2.081-0.139-3.14-0.139c-11.83,0-22.418,5.281-29.56,13.607 c-3.718-0.975-7.62-1.499-11.643-1.499c-7.931,0-15.39,2.019-21.895,5.567c-6.504-3.549-13.963-5.567-21.894-5.567 c-4.024,0-7.924,0.524-11.644,1.499c-7.141-8.326-17.73-13.607-29.558-13.607c-1.059,0-2.104,0.056-3.142,0.139v-54.173h-28.853 v75.924c0,52.517,42.574,95.09,95.09,95.09c52.518,0,95.09-42.573,95.09-95.09v-75.924H280.635z"
          />
          <path
            opacity="0.2"
            fill="#222222"
            d="M142.132,123.861c-5.748,7.242-10.437,15.363-13.821,24.134h-9.003v75.924 c0,52.517,42.574,95.09,95.09,95.09V123.861H142.132z"
          />
          <ellipse
            :style="rightEyelidStyle"
            :cx="262.785"
            :cy="185.958"
            rx="24.797"
            ry="24.797"
            fill="#f1c2b2"
            opacity="0.95"
          />
          <!-- Oczy -->
          <circle fill="#fff" cx="262.785" cy="185.958" r="24.797" />
          <circle fill="#333e48" cx="262.785" cy="185.958" r="10.858" />
          <!-- Powieka prawa -->
          <ellipse
            :style="rightEyelidStyle"
            :cx="262.785"
            :cy="185.958"
            rx="24.797"
            ry="24.797"
            fill="#f1c2b2"
            opacity="0.95"
          />
          <circle fill="#fff" cx="166.011" cy="185.958" r="24.797" />
          <circle fill="#333e48" cx="166.011" cy="185.958" r="10.858" />
          <!-- Powieka lewa -->
          <ellipse
            :style="leftEyelidStyle"
            :cx="166.011"
            :cy="185.958"
            rx="24.797"
            ry="24.797"
            fill="#f1c2b2"
            opacity="0.95"
          />
          <!-- Czapka -->
          <path
            fill="#ff5959"
            d="M311.681,120.879L242.856,16.296c-0.57-0.97-1.186-1.909-1.85-2.811l-0.001,0 C234.999,5.309,225.32,0,214.398,0c-10.921,0-20.601,5.309-26.607,13.484v0c-0.664,0.903-1.28,1.842-1.85,2.811l-68.825,104.584 c-4.957,5.773-7.959,13.274-7.959,21.48c0,18.227,14.776,33.002,33.002,33.002h144.478c18.227,0,33.002-14.775,33.002-33.002 C319.639,134.153,316.638,126.652,311.681,120.879z"
          />
          <path
            opacity="0.3"
            fill="#222222"
            d="M187.79,13.484L187.79,13.484c-0.664,0.903-1.28,1.842-1.85,2.812l-68.825,104.584 c-4.957,5.773-7.959,13.274-7.959,21.48c0,18.227,14.776,33.002,33.002,33.002h72.239V0C203.477,0,193.797,5.309,187.79,13.484z"
          />

          <!-- Usta -->
          <path
            fill="#6b3f23"
            d="M168.958,223.51c0,25.096,20.344,45.44,45.44,45.44s45.44-20.344,45.44-45.44H168.958z"
            :style="mouthStyle"
          />
          <!-- Nos -->
          <path
            fill="#ff637d"
            d="M226.466,200.461c-1.969-4.726-6.629-8.049-12.068-8.049c-5.439,0-10.1,3.324-12.068,8.049 c-6.099,0.292-10.958,5.314-10.958,11.486c0,12.717,10.31,23.026,23.026,23.026c12.717,0,23.027-10.31,23.027-23.026 C237.425,205.776,232.566,200.753,226.466,200.461z"
          />
          <!-- Język -->
          <path
            fill="#ff8f9c"
            d="M214.398,249.593c-10.947,0-21.211,2.9-30.092,7.952c8.016,7.093,18.547,11.405,30.092,11.405 c11.545,0,22.078-4.313,30.092-11.405C235.61,252.493,225.345,249.593,214.398,249.593z"
            :style="tongueStyle"
          />
        </g>
      </g>
    </svg>
    <button
      @click="wave"
      class="mt-2 px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
    >
      Pomachaj lewą ręką
    </button>
    <div class="flex gap-2 mt-2">
      <input
        type="number"
        min="1"
        v-model.number="sleepDuration"
        class="w-16 px-1 py-0.5 rounded border text-xs"
        :disabled="sleepSwitch"
      />
      <button
        @click="sleep(sleepDuration)"
        class="px-3 py-1 rounded bg-purple-500 text-white text-xs hover:bg-purple-600"
        :disabled="sleepSwitch"
      >
        Uśpij na czas
      </button>
      <label class="flex items-center gap-1 text-xs">
        <input type="checkbox" v-model="sleepSwitch" @change="sleep(sleepSwitch)" />
        Śpij (włącz/wyłącz)
      </label>
    </div>
    <button
      @click="say('Witaj w quizie!')"
      class="mt-2 px-3 py-1 rounded bg-green-500 text-white text-xs hover:bg-green-600"
    >
      Powiedz coś
    </button>
    <div
      v-if="speechBubble"
      class="speech-bubble mb-2 text-xs"
      style="position: absolute; left: 100%; top: 60px; margin-left: 16px; z-index: 10"
    >
      {{ speechBubble }}
    </div>
    <div class="flex gap-2 mt-2">
      <input
        type="number"
        min="1"
        v-model.number="walkDuration"
        class="w-16 px-1 py-0.5 rounded border text-xs"
        :disabled="walkSwitch"
      />
      <button
        @click="walk(walkDuration)"
        class="px-3 py-1 rounded bg-yellow-500 text-white text-xs hover:bg-yellow-600"
        :disabled="walkSwitch"
      >
        Idź na czas
      </button>
      <label class="flex items-center gap-1 text-xs">
        <input type="checkbox" v-model="walkSwitch" @change="walk(walkSwitch)" />
        Idź (włącz/wyłącz)
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  size: { type: Number, default: 220 },
});

const waving = ref(false);
const sleeping = ref(false);
const leftArmStyle = ref({});
const sleepDuration = ref(5); // domyślnie 5 sekund
const sleepSwitch = ref(false);
const walkDuration = ref(5); // domyślnie 5 sekund
const walkSwitch = ref(false);
let sleepTimeout = null;
let walkTimeout = null;

// --- Animacja powiek (mruganie) ---
const leftEyelidStyle = ref({
  transition: 'transform 0.12s',
  transform: 'translateY(-25px)',
});
const rightEyelidStyle = ref({
  transition: 'transform 0.12s',
  transform: 'translateY(-25px)',
});
let blinkTimeout = null;
function blink() {
  if (sleeping.value) return; // nie mrugaj podczas snu
  leftEyelidStyle.value = {
    transition: 'transform 0.12s',
    transform: 'translateY(0px)',
  };
  rightEyelidStyle.value = {
    transition: 'transform 0.12s',
    transform: 'translateY(0px)',
  };
  setTimeout(() => {
    leftEyelidStyle.value = {
      transition: 'transform 0.15s',
      transform: 'translateY(-25px)',
    };
    rightEyelidStyle.value = {
      transition: 'transform 0.15s',
      transform: 'translateY(-25px)',
    };
  }, 120);
  blinkTimeout = setTimeout(
    () => {
      blink();
    },
    2000 + Math.random() * 2000
  );
}
onMounted(() => {
  blinkTimeout = setTimeout(() => blink(), 1500);
});
onUnmounted(() => {
  clearTimeout(blinkTimeout);
});

// --- Machanie ręką ---
function wave() {
  if (waving.value) return;
  waving.value = true;
  // 1. Do 120°
  leftArmStyle.value = {
    transform: 'rotate(120deg)',
    transformOrigin: '149.838px 271.225px',
    transition: 'transform 0.32s cubic-bezier(.4,2,.6,1)',
  };
  setTimeout(() => {
    // 2. Do 90°
    leftArmStyle.value = {
      transform: 'rotate(90deg)',
      transformOrigin: '149.838px 271.225px',
      transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
    };
    setTimeout(() => {
      // 3. Pauza w 90°
      leftArmStyle.value = {
        transform: 'rotate(90deg)',
        transformOrigin: '149.838px 271.225px',
        transition: 'transform 0.18s cubic-bezier(.4,2,.6,1)',
      };
      setTimeout(() => {
        // 4. Do 120°
        leftArmStyle.value = {
          transform: 'rotate(120deg)',
          transformOrigin: '149.838px 271.225px',
          transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
        };
        setTimeout(() => {
          // 5. Powrót do 0°
          leftArmStyle.value = {
            transform: 'rotate(0deg)',
            transformOrigin: '149.838px 271.225px',
            transition: 'transform 0.38s cubic-bezier(.4,2,.6,1)',
          };
          setTimeout(() => {
            waving.value = false;
          }, 380);
        }, 220);
      }, 180);
    }, 220);
  }, 320);
}

// --- Sen (zamykanie powiek) ---
function sleep(durationOrBool) {
  if (typeof durationOrBool === 'boolean') {
    if (durationOrBool) {
      // Usypianie na stałe
      sleeping.value = true;
      leftEyelidStyle.value = {
        transition: 'transform 1.2s',
        transform: 'translateY(0px)',
      };
      rightEyelidStyle.value = {
        transition: 'transform 1.2s',
        transform: 'translateY(0px)',
      };
    } else {
      // Wybudzanie
      sleeping.value = false;
      leftEyelidStyle.value = {
        transition: 'transform 1.2s',
        transform: 'translateY(-25px)',
      };
      rightEyelidStyle.value = {
        transition: 'transform 1.2s',
        transform: 'translateY(-25px)',
      };
    }
    return;
  }
  // Usypianie na określony czas
  if (sleeping.value) return;
  sleeping.value = true;
  leftEyelidStyle.value = {
    transition: 'transform 1.2s',
    transform: 'translateY(0px)',
  };
  rightEyelidStyle.value = {
    transition: 'transform 1.2s',
    transform: 'translateY(0px)',
  };
  clearTimeout(sleepTimeout);
  sleepTimeout = setTimeout(
    () => {
      leftEyelidStyle.value = {
        transition: 'transform 1.2s',
        transform: 'translateY(-25px)',
      };
      rightEyelidStyle.value = {
        transition: 'transform 1.2s',
        transform: 'translateY(-25px)',
      };
      setTimeout(() => {
        sleeping.value = false;
      }, 1200);
    },
    (durationOrBool || sleepDuration.value) * 1000
  );
}

// --- Gadanina (bąbelki mowy) ---
const mouthStyle = ref({
  transition: 'transform 0.18s',
  transform: 'scaleY(1)',
  transformOrigin: 'center bottom',
  transformBox: 'fill-box',
});
const tongueStyle = ref({
  transition: 'transform 0.18s',
  transform: 'scaleY(1) translateY(0px)',
  transformOrigin: 'center bottom',
  transformBox: 'fill-box',
});
const speechBubble = ref('');
const talking = ref(false);
let talkInterval = null;
let bubbleTimeout = null;
function say(text = 'Cześć!') {
  if (talking.value) return;
  talking.value = true;
  speechBubble.value = text;
  let up = false;
  let step = 0;
  talkInterval = setInterval(() => {
    up = !up;
    step++;
    mouthStyle.value = {
      transition: 'transform 0.18s',
      transform: up ? 'scaleY(0.9)' : 'scaleY(1.1)',
      transformOrigin: 'center bottom',
      transformBox: 'fill-box',
    };
    tongueStyle.value = {
      transition: 'transform 0.18s',
      transform: up ? 'scaleY(1) translateY(-7px)' : 'scaleY(1) translateY(0px)',
      transformOrigin: 'center bottom',
      transformBox: 'fill-box',
    };
    if (step > 8) {
      clearInterval(talkInterval);
      mouthStyle.value = {
        transition: 'transform 0.18s',
        transform: 'scaleY(1)',
        transformOrigin: 'center bottom',
      };
      tongueStyle.value = {
        transition: 'transform 0.18s',
        transform: 'scaleY(1) translateY(0px)',
        transformOrigin: 'center bottom',
      };
      talking.value = false;
      bubbleTimeout = setTimeout(() => {
        speechBubble.value = '';
      }, 5000);
    }
  }, 180);
}

const walking = ref(false);
let walkInterval = null;
const walkStyle = ref({
  transition: 'transform 0.18s',
  transform: 'translateY(0px)',
});

function walk(durationOrBool) {
  if (typeof durationOrBool === 'boolean') {
    if (durationOrBool) {
      if (walking.value) return;
      walking.value = true;
      startWalking();
    } else {
      walking.value = false;
      stopWalking();
    }
    return;
  }
  // Chodzenie na określony czas
  if (walking.value) return;
  walking.value = true;
  startWalking();
  clearTimeout(walkTimeout);
  walkTimeout = setTimeout(
    () => {
      walking.value = false;
      stopWalking();
    },
    (durationOrBool || 5) * 1000
  );
}

function startWalking() {
  let step = 0;
  walkInterval = setInterval(() => {
    // Podnoszenie nóg naprzemiennie
    if (step % 2 === 0) {
      leftLegStyle.value = {
        transition: 'transform 0.18s',
        transform: 'translateY(-18px)',
      };
      rightLegStyle.value = {
        transition: 'transform 0.18s',
        transform: 'translateY(0px)',
      };
    } else {
      leftLegStyle.value = {
        transition: 'transform 0.18s',
        transform: 'translateY(0px)',
      };
      rightLegStyle.value = {
        transition: 'transform 0.18s',
        transform: 'translateY(-18px)',
      };
    }
    // Cała postać lekko podskakuje
    walkStyle.value = {
      transition: 'transform 0.18s',
      transform: `translateY(${step % 2 === 0 ? -12 : 0}px)`,
    };
    step++;
  }, 180);
}

function stopWalking() {
  clearInterval(walkInterval);
  walkStyle.value = {
    transition: 'transform 0.18s',
    transform: 'translateY(0px)',
  };
  leftLegStyle.value = {
    transition: 'transform 0.18s',
    transform: 'translateY(0px)',
  };
  rightLegStyle.value = {
    transition: 'transform 0.18s',
    transform: 'translateY(0px)',
  };
}

const leftLegStyle = ref({
  transition: 'transform 0.18s',
  transform: 'translateY(0px)',
});
const rightLegStyle = ref({
  transition: 'transform 0.18s',
  transform: 'translateY(0px)',
});
</script>

<style scoped>
.speech-bubble {
  background: #fff;
  border-radius: 16px;
  border: 2px solid #bbb;
  padding: 8px 16px;
  color: #222;
  position: relative;
  max-width: 180px;
  box-shadow: 0 2px 8px #0002;
}
.speech-bubble::after {
  content: '';
  position: absolute;
  left: -14px;
  top: 20px;
  width: 0;
  height: 0;
  border: 8px solid transparent;
  border-right: 10px solid #fff;
  border-left: 0;
  filter: drop-shadow(-2px 2px 2px #bbb);
}
</style>
