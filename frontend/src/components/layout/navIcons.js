import { h } from 'vue';

// Ikony nawigacji jako funkcje renderujące — wspólne dla navbaru i sidebara.
const makeIcon = (props, children) => ({
  render: () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', ...props }, children),
});
const path = (props) => h('path', props);
const rect = (props) => h('rect', props);

export const HomeIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      d: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
    }),
  ]
);

export const HistoryIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      'fill-rule': 'evenodd',
      d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      'clip-rule': 'evenodd',
    }),
  ]
);

export const ListIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
  [
    path({
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '2',
      d: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    }),
  ]
);

export const UserIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      'fill-rule': 'evenodd',
      d: 'M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z',
      'clip-rule': 'evenodd',
    }),
  ]
);

export const AdminIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 20 20', fill: 'currentColor' },
  [
    path({
      'fill-rule': 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z',
      'clip-rule': 'evenodd',
    }),
  ]
);

export const DuplicateIcon = makeIcon(
  { class: 'h-5 w-5', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' },
  [
    rect({ x: '4', y: '4', width: '16', height: '16', rx: '2', 'stroke-width': '2', fill: 'none' }),
    rect({ x: '8', y: '8', width: '8', height: '8', rx: '1', 'stroke-width': '2', fill: 'none' }),
  ]
);

export const NAV_ITEMS = [
  { path: '/', label: 'Strona główna', icon: HomeIcon },
  { path: '/history', label: 'Historia', icon: HistoryIcon },
  { path: '/questions', label: 'Lista pytań', icon: ListIcon },
  { path: '/duplikaty', label: 'Duplikaty pytań', icon: DuplicateIcon, adminOnly: true },
  { path: '/user', label: 'Panel użytkownika', icon: UserIcon },
  { path: '/admin', label: 'Panel administracyjny', icon: AdminIcon, adminOnly: true },
];
