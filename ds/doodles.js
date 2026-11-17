// Дизайн-система «Каракули» — рисунки. Все — inline SVG, цвета берутся из токенов,
// поэтому котики сами перекрашиваются в тёмной теме. Использование: el.innerHTML = DOODLES.loaf
window.DOODLES = {
  // серый полосатый котик спит буханочкой (пустой экран)
  loaf: `<svg class="k-doodle" viewBox="0 0 130 92" width="130" height="92" aria-hidden="true">
    <text class="zzz" x="18" y="22">z</text><text class="zzz" x="28" y="12" style="animation-delay:.6s">z</text>
    <path class="ink fill-gray" d="M24 80 C17 62 28 44 54 41 C80 38 104 47 111 65 C114 75 107 80 96 80 Z"/>
    <path class="feat" d="M66 43 q3 6 0 11 M77 42 q3 6 0 11 M88 45 q3 5 0 10 M99 51 q2 4 0 8"/>
    <path class="ink fill-gray" d="M20 49 L18 33 L31 41 Z M44 41 L55 33 L55 49 Z"/>
    <path class="ink fill-gray" d="M16 64 C14 50 24 41 37 41 C50 41 58 50 57 62 C56 73 48 80 36 80 C24 80 17 73 16 64 Z"/>
    <path class="feat" d="M24 61 q3.5 3 7 0 M41 61 q3.5 3 7 0 M34 67 q1.8 1.6 3.6 0"/>
    <path class="ink" d="M10 65 l7 1 M10 70 l7 -1 M65 65 l-6 1 M65 70 l-6 -1"/>
    <path class="ink tail" style="--tail-x:104px;--tail-y:76px" d="M106 74 C120 78 112 88 86 86"/>
  </svg>`,

  // трёхцветная кошка сидит и смотрит (ничего не найдено)
  sit: `<svg class="k-doodle" viewBox="0 0 90 110" width="90" height="110" aria-hidden="true">
    <path class="ink tail" style="--tail-x:58px;--tail-y:98px" d="M58 98 C78 100 84 82 74 72"/>
    <path class="ink fill-paper" d="M30 50 C20 64 19 92 25 102 L59 102 C65 92 64 64 54 50 Z"/>
    <path class="fill-cat" d="M50 60 c7 3 9 13 5 20 c-5 0 -9 -8 -5 -20z"/>
    <path class="feat" d="M36 78 L36 101 M48 78 L48 101 M31 102 q4 -3 8 0 M45 102 q4 -3 8 0"/>
    <path class="ink fill-paper" d="M25 30 L23 10 L38 19 Z M46 19 L61 10 L59 30 Z"/>
    <path class="fill-ginger" d="M25 30 L23.5 12 L36 19.5 C31 22 28 26 25 30Z"/>
    <path class="ink fill-paper" d="M23 36 C23 23 31 16 42 16 C53 16 61 23 61 36 C61 47 53 54 42 54 C31 54 23 47 23 36 Z"/>
    <path class="fill-ginger" d="M24.5 31 C27 22 34 17.5 41 17 C39 26 33 33 24 39 Z"/>
    <path class="ink" d="M23 36 C23 23 31 16 42 16 C53 16 61 23 61 36"/>
    <circle class="fill-cat" cx="35" cy="36" r="2.2"/><circle class="fill-cat" cx="49" cy="36" r="2.2"/>
    <path class="feat" style="stroke-width:2" d="M40 41 l2 2 l2 -2 M42 43 q-2 3 -4.5 1.5 M42 43 q2 3 4.5 1.5"/>
    <path class="ink" style="stroke-width:1.6" d="M16 38 l8 1.5 M16 44 l8 -1 M68 38 l-8 1.5 M68 44 l-8 -1"/>
  </svg>`,

  // рыжий котик лежит на боку (загрузка)
  lie: `<svg class="k-doodle" viewBox="0 0 120 56" width="120" height="56" aria-hidden="true">
    <path class="ink tail" style="--tail-x:98px;--tail-y:36px" d="M98 36 C110 34 116 24 110 16"/>
    <path class="ink fill-ginger" d="M30 30 C34 20 52 18 72 20 C90 22 102 28 100 38 C98 46 84 47 66 46 C48 45 30 42 30 30 Z"/>
    <path class="feat" d="M50 21 q-2 6 1 11 M62 20 q-2 6 1 12 M74 21 q-2 6 1 12 M86 24 q-2 5 1 10"/>
    <path class="ink" d="M40 44 L34 52 M50 45 L46 53 M84 46 L90 53 M92 44 L100 50"/>
    <path class="ink fill-ginger" d="M12 22 L10 8 L21 15 Z M28 15 L37 8 L37 22 Z"/>
    <path class="ink fill-ginger" d="M8 32 C6 21 14 14 24 14 C34 14 40 21 40 30 C40 39 33 44 24 44 C14 44 9 39 8 32 Z"/>
    <path class="feat" d="M16 29 q3 2.6 6 0 M28 29 q3 2.6 6 0 M24 35 q1.5 1.3 3 0"/>
  </svg>`,

  // мордочка для реплик и иконок
  face: `<svg class="k-doodle" viewBox="0 0 48 44" width="34" height="32" aria-hidden="true">
    <path class="ink fill-paper" d="M7 18 L6 3 L18 10 Z M30 10 L42 3 L41 18 Z"/>
    <path class="ink fill-paper" d="M5 24 C5 13 13 8 24 8 C35 8 43 13 43 24 C43 34 35 40 24 40 C13 40 5 34 5 24 Z"/>
    <path class="fill-ginger" d="M7 17 L6.5 5 L16 10.5 C12 12 9 14 7 17Z"/>
    <circle class="fill-cat" cx="17" cy="24" r="2"/><circle class="fill-cat" cx="31" cy="24" r="2"/>
    <path class="feat" style="stroke-width:2" d="M22 29 l2 2 l2 -2 M24 31 q-2 2.5 -4 1 M24 31 q2 2.5 4 1"/>
  </svg>`,

  // лапка (иконка)
  paw: `<svg class="k-doodle" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
    <path class="ink" d="M16 28 C9 28 7 23 10 19 C12 16 14 15 16 15 C18 15 20 16 22 19 C25 23 23 28 16 28 Z"/>
    <ellipse class="ink" cx="7" cy="13" rx="3" ry="3.6"/><ellipse class="ink" cx="12.5" cy="7.5" rx="3" ry="3.8"/>
    <ellipse class="ink" cx="19.5" cy="7.5" rx="3" ry="3.8"/><ellipse class="ink" cx="25" cy="13" rx="3" ry="3.6"/>
  </svg>`,

  // лупа и стрелка «назад», нарисованные от руки
  loupe: `<svg class="k-doodle" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path class="ink" d="M10.5 4.2 C14.6 4 17.2 6.8 17 10.6 C16.8 14.3 14 16.9 10.4 16.8 C6.6 16.7 4 14 4.2 10.3 C4.4 6.8 7 4.4 10.5 4.2 Z M15.3 15.6 L20.2 20.4"/>
  </svg>`,
  back: `<svg class="k-doodle" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path class="ink" style="stroke-width:2.6" d="M14.8 5.2 L8.2 12.2 L15.2 18.8"/>
  </svg>`,
  close: `<svg class="k-doodle" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path class="ink" style="stroke-width:2.6" d="M6.5 6.2 L17.6 17.5 M17.3 6.4 L6.4 17.4"/>
  </svg>`,
};
