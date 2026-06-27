# План: расширенный кросс-платформенный Pomodoro (Vue + TS, FSD)

## Context
Текущий проект — маленький vanilla-JS Electron-таймер (`main.js`, `src/renderer.js`). Полностью переписываем его как продукт: расширенный Pomodoro с темами/стилями, в будущем — таск-менеджмент, аккаунты с авторизацией для синхронизации настроек и подписка. Таргеты: **web (браузер/PWA) + desktop (mac/linux/win) + mobile (iOS/Android)**. Стек — **Vue 3 + TypeScript**, архитектура — **FSD + модульность**. Затем — релиз в **новый репозиторий** со скачиваемыми сборками.

Цель — заложить архитектуру, которая закрывает все 4 таргета из одного кода и масштабируется до auth/tasks/подписки без переделок.

## Зафиксированные решения
- **Десктоп-оболочка:** **Tauri** (на старте). Linux — приоритет: лёгкий, AppImage/.deb/.rpm; принят риск WebKitGTK (для таймера некритичен), митигируем ранним тестированием. Electron не берём (тяжёлый, не умеет mobile).
- **Структура:** один Vite Vue+TS апп (FSD) + тонкие оболочки **Tauri** (desktop) и **Capacitor** (mobile); тот же бандл отдаётся как **web/PWA**.
- **Бэкенд:** **Supabase** (Auth + Postgres + RLS + Edge Functions), биллинг — **Stripe** (web/desktop) и нативный IAP/RevenueCat (mobile, позже).
- **Пакетный менеджер:** **bun** (1.3). Vite + Vue 3 `<script setup>` + Pinia + Vue Router.
- **UI:** **shadcn-vue** (reka-ui + Tailwind), компоненты копируются в `shared/ui`.
- **Стили/темы:** Tailwind поверх **CSS-переменных** — та же модель, что у shadcn-vue, поэтому наши кастомные темы и shadcn-токены живут в одной системе.

## Главный архитектурный принцип
Tauri и Capacitor — тонкие обёртки, загружающие **один и тот же собранный веб-бандл**. Значит UI-апп один; платформенные различия скрыты за адаптером `shared/platform`.

```
один Vite-бандл (dist/) ─┬─► web / PWA
                         ├─► Tauri  → desktop (dmg/msi/AppImage) + auto-update
                         └─► Capacitor → mobile (apk/ipa)
```

## Структура репозитория
```
src/
├─ app/        # init, router, providers, theme-provider, i18n
├─ pages/      # timer, tasks, settings, account, paywall
├─ widgets/    # timer-ring, task-list, theme-switcher, nav
├─ features/   # auth, timer-control, theme-switch, settings-sync, tasks, subscription
├─ entities/   # session, task, user, subscription, theme
└─ shared/
   ├─ ui/        # shadcn-vue компоненты + наш дизайн-кит (Tailwind + CSS-vars)
   ├─ api/       # Supabase-клиент, типы, data-access
   ├─ platform/  # ★ адаптер: storage / notifications / tray / haptics / purchase
   ├─ config/    # темы-токены, env, ts/eslint/tailwind preset
   └─ lib/       # утилиты, таймер-движок (порт логики)
src-tauri/      # desktop-оболочка (Rust, в основном генерится)
ios/ android/   # нативные проекты Capacitor (генерятся)
supabase/       # миграции + edge functions (Stripe webhooks)
```

## Слой `shared/platform` (ключ к кросс-платформенности)
Интерфейс + 3 реализации (web / tauri / capacitor), выбор на этапе сборки через alias в Vite:
- `storage` — offline-настройки: localStorage / Tauri Store / Capacitor Preferences.
- `notifications` — уведомление о конце сессии.
- `tray` / mini-mode — только desktop (Tauri), на остальных no-op.
- `haptics` — mobile.
- `purchase` — Stripe Checkout (web/desktop) vs нативный IAP (mobile; App Store/Play требуют IAP для цифровой подписки).

## Темизация
- Токены тем — TS-объекты в `shared/config/themes/*`, инжектятся как CSS-переменные в `:root[data-theme=...]` (включая shadcn-токены: `--background`, `--primary` и т.д.).
- Tailwind настроен на эти переменные → и утилиты, и shadcn-компоненты тема-зависимы автоматически.
- `features/theme-switch` сохраняет выбор локально + синкает в аккаунт; премиум-темы гейтятся через `entities/subscription`.

## Данные и синхронизация (offline-first)
- Локальный стор (Pinia + `shared/platform/storage`) — источник правды для запущенного таймера; работает без сети.
- При логине настройки/сессии/задачи синкаются в Supabase; reconcile на входе.
- Auth: Supabase (email + OAuth). Хранение per-user через RLS.
- Подписка: Stripe Checkout (web/desktop), IAP (mobile) — флаг `is_premium` гейтит премиум-темы/фичи.

## Порт текущих фич в новый стек
Перенести из `src/renderer.js`: 3 режима, цикл 4 фокуса → длинный перерыв (`completedFocus % 4`), настройки (длительности/auto-start/sound), WebAudio-chime, прогресс-кольцо (`stroke-dasharray`). Mini-mode/tray — только desktop через `shared/platform`.

## Подход к работе
Реализуем **часть за частью вместе** — каждый этап ниже делаем отдельно, с проверкой, прежде чем идти дальше.

## Этапы реализации
0. **Сохранить план:** `PLAN.md` (корень репо) + память Claude. ✅
1. **Каркас:** Vite + Vue 3 + TS + Pinia + Router + Tailwind + **shadcn-vue init**, FSD-скелет, `shared/platform` (web-реализация). Менеджер — bun.
2. **Таймер MVP:** порт движка таймера, 3 режима, цикл, прогресс-кольцо, chime, локальная персистентность.
3. **Темы:** система токенов + переключатель + 2-3 базовые темы.
4. **Desktop (Tauri 2):** `src-tauri`, нативные уведомления, tray/mini-mode, auto-updater. **Linux:** тестировать на WebKitGTK с самого начала, не закладываться на Chromium-only CSS; сборки **AppImage + .deb + .rpm** с зависимостью `libwebkit2gtk`.
5. **Mobile (Capacitor):** `ios/`+`android/`, нативные уведомления, haptics.
6. **Бэкенд (Supabase):** схема (users/settings/tasks/subscriptions), RLS, auth-фича, settings-sync.
7. **Tasks:** `entities/task` + `features/tasks` + страница.
8. **Подписка:** Stripe edge function + paywall + гейтинг премиум-тем.
9. **Релиз:** новый GitHub-репозиторий + CI (Actions matrix) → GitHub Releases (desktop-инсталляторы + Android APK), web на статик-хост (Vercel/Pages), iOS — TestFlight позже.

## Предусловия окружения
- **Rust + cargo** (для Tauri) — установить через rustup.
- **Xcode** (iOS) и **Android Studio/SDK** (Android) — для мобильных сборок.
- **bun 1.3** — стоит; Node 25 — ок.

## Релиз в новый репозиторий
- Создать новый репо (напр. `pomodoro` / `pomodoro_app`), не переиспользуя `pomodoro_electron`.
- Auto-update desktop через Tauri updater + GitHub Releases.
- iOS свободно «скачать» нельзя без подписи — раздаём desktop-инсталляторы и Android APK; iOS через TestFlight/App Store.

## Verification
- `dev`: `bun run dev` — web-версия в браузере, таймер/темы/настройки работают offline.
- Desktop: `tauri dev` — окно, уведомления, tray/mini-mode.
- Mobile: `cap run android` / `cap run ios` — таймер, уведомления, haptics.
- Auth/sync: логин в Supabase, проверка что настройки сохраняются и подтягиваются на другом таргете.
- Сборка релиза: тег `v*` → CI собирает desktop-инсталляторы + APK и публикует в GitHub Releases; web деплоится на статик-хост.
- Регрессия фич: 3 режима, цикл 4→длинный перерыв, chime, прогресс-кольцо, переключение тем.

## Остаётся уточнить (по ходу)
- Имя нового GitHub-репозитория и хостинг web (Vercel / Netlify / Cloudflare Pages / GitHub Pages) — на шаге 9.
