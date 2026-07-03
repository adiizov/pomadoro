# Architecture.md

Живая документация архитектуры проекта **Pomodoro** (расширенный кросс-платформенный таймер).
**Читать перед каждым «создай / добавь» и обновлять после каждого изменения архитектуры.**
Дорожная карта и этапы — в [PLAN.md](./PLAN.md).

---

## 1. Назначение и таргеты
Один Vue 3 + TypeScript код, который собирается под:
- **web / PWA** (браузер)
- **desktop** — Tauri (mac / linux / win)
- **mobile** — Capacitor (iOS / Android)

Растёт до: темы/стили, таск-менеджмент, аккаунты с авторизацией, синхронизация настроек, подписка.

## 2. Стек (зафиксирован)
| Слой | Выбор |
|---|---|
| Пакетный менеджер | **bun** 1.3 |
| Сборка | Vite 8 |
| Фреймворк | Vue 3.5 `<script setup>` + TypeScript 6 |
| Стор | Pinia |
| Роутинг | Vue Router |
| Стили | Tailwind v4 (`@tailwindcss/vite`) + CSS-переменные |
| UI-компоненты | **shadcn-vue** (reka-ui), кладутся в `src/shared/ui` |
| Иконки | lucide-vue-next |
| Локализация | **vue-i18n** v11 — все UI-строки через i18n (en/ru) |
| Desktop | Tauri (на старте; Linux в приоритете) |
| Mobile | Capacitor |
| Бэкенд (позже) | Supabase (Auth + Postgres + RLS + Edge Functions) |
| Биллинг (позже) | Stripe (web/desktop) + нативный IAP (mobile) |

## 3. Главный принцип кросс-платформенности
Tauri и Capacitor — тонкие обёртки, грузящие **один и тот же Vite-бандл**. UI-апп один; различия платформ скрыты за адаптером `src/shared/platform`.

```
один Vite-бандл (dist/) ─┬─► web / PWA
                         ├─► Tauri  → desktop
                         └─► Capacitor → mobile
```

## 4. Структура (Feature-Sliced Design)
```
src/
├─ app/                  # инициализация приложения
│  ├─ App.vue            # корень (RouterView)
│  ├─ index.ts           # bootstrap(): createApp + pinia + router + mount
│  └─ router/index.ts    # маршруты (lazy import страниц)
├─ pages/                # страницы-роуты
│  └─ timer/TimerPage.vue          # композиция кольца + управления
├─ widgets/              # композиции из features/entities
│  └─ timer-ring/        # SVG-кольцо прогресса + время + фаза + точки цикла
├─ features/             # пользовательские сценарии
│  ├─ timer-control/     # табы режимов + start/pause/reset/skip
│  └─ theme-switch/      # ThemeSwitcher.vue — выбор цвет-темы + light/dark/system
├─ entities/             # бизнес-сущности
│  ├─ session/           # домен сессии: model/{types,session.store} + index (barrel)
│  └─ theme/             # домен темы: model/{types,theme.store} — выбор темы+режима, персист, применение к <html>
└─ shared/               # переиспользуемое, без бизнес-логики
   ├─ ui/                # shadcn-vue компоненты + свой дизайн-кит
   ├─ api/               # Supabase-клиент, data-access (позже)
   ├─ lib/               # utils.ts (cn), format.ts (mm:ss), chime.ts (WebAudio)
   ├─ config/
   │  ├─ i18n/           # createI18n + locales/{en,ru} + translate() для сторов
   │  └─ themes/         # токены тем: {types,themes,stylesheet} + index — TS-объекты + генерация CSS
   └─ platform/          # ★ адаптер платформ
      ├─ types.ts        # IPlatform, IStorageAdapter, INotificationsAdapter, IWindowAdapter, TPlatformName
      ├─ index.ts        # resolvePlatform() → активная платформа (runtime-детект)
      ├─ web/            # реализация для браузера (готово)
      ├─ tauri/          # desktop: store + notification плагины + window.setMini (готово, шаг 4)
      └─ capacitor/      # mobile: preferences + local-notifications + haptics (готово, шаг 5)

src-tauri/              # desktop-оболочка (Rust): грузит тот же web-бандл
├─ Cargo.toml           # tauri (feature tray-icon) + store/notification/single-instance/log плагины
├─ tauri.conf.json      # окно 420×620, bundle targets (appimage/deb/rpm/app/dmg/nsis)
├─ capabilities/        # ACL: core+store+notification
└─ src/lib.rs           # плагины, tray-меню (Show/Hide, Quit), close-to-tray, команда set_mini

capacitor.config.ts     # appId com.pomodoro.app, webDir dist
android/                # нативный Android-проект (сгенерён `cap add android`)
# ios/ — генерится `cap add ios` на macOS (нужен Xcode); отложено
```

**Правила FSD:** зависимости только «вниз» (`app → pages → widgets → features → entities → shared`). Слой не импортирует соседа того же уровня и ничего «вверх». Кросс-платформенные различия — только через `shared/platform`, фичи остаются платформо-независимыми.

## 5. Слой `shared/platform`
Интерфейсы + реализации на платформу, выбор в `index.ts` через runtime-детект (`__TAURI_INTERNALS__`/`__TAURI__` → tauri, иначе web; capacitor — шаг 5).
- `storage` — `get/set/remove` (web: localStorage; tauri: plugin-store `pomodoro.json`; capacitor: `@capacitor/preferences`)
- `notifications` — `ensurePermission/notify` (web: Notification API; tauri: plugin-notification; capacitor: `@capacitor/local-notifications`)
- `window?` — **desktop-only**, present только у tauri: `setMini(mini)` → resize + always-on-top + hide decorations (Rust-команда `set_mini`). На web/mobile поля нет (`platform.window` undefined), UI-гейт `Boolean(platform.window)`.
- `haptics?` — **mobile-only**, present только у capacitor: `impact()` (`@capacitor/haptics`). Вызывается в `finishSession` через `platform.haptics?.impact()`; на web/desktop поля нет.
- *(позже)* `purchase` — Stripe (web/desktop) vs IAP (mobile)

## 6. Темизация (шаг 3 — готово)
Две ортогональные оси: **цвет-тема** (`data-theme`) и **режим** (light/dark через класс `.dark`).
- **База/нейтрали** — CSS-переменные в `src/style.css`: `:root` (light) и `.dark`. Совместимы с shadcn-vue (`--background`, `--primary`, …). `@theme inline` маппит их в Tailwind-утилиты → и утилиты, и shadcn-компоненты тема-зависимы.
- **Цвет-темы** — TS-объекты в `shared/config/themes/themes.ts` (`coral`/`ocean`/`forest`/`grape`), каждая переопределяет brand-токены (`--primary`,`--ring`). `injectThemeStyles()` один раз генерит `<style id="app-theme-tokens">` с правилами `:root[data-theme="<id>"]{…}`; переключение = смена атрибута `data-theme`, дальше работает каскад (специфичность `data-theme` > `.dark`, поэтому brand-цвет держится и в тёмном режиме).
- **Стор** `entities/theme` (Pinia): `themeId` + `mode` (light/dark/system, `system` слушает `prefers-color-scheme`), `watchEffect` применяет `data-theme` и `.dark` на `<html>`, персист через `shared/platform/storage` (ключ `pomodoro:theme`). `injectThemeStyles()` вызывается в `bootstrap()`, `theme.load()` — в `App.vue onMounted`.
- **UI** — `features/theme-switch/ThemeSwitcher.vue` (свотчи тем + сегмент Sun/Moon/Monitor), размещён в `TimerPage`. Названия/режимы — через i18n (`theme.*`).
- **Премиум:** у темы есть флаг `premium` (пока `grape`), в свотче показывается замок; реальный гейтинг подпиской — шаг 8.

## 7. Локализация (i18n)
- **Все** строки, видимые пользователю, идут через `vue-i18n` — никакого хардкода в шаблонах/сторе.
- Конфиг — `shared/config/i18n` (`legacy: false`, локали `en`/`ru`, fallback `en`).
- В компонентах: `const { t } = useI18n()` → `t('controls.start')`.
- Вне компонентов (Pinia-сторы и пр.): `import { translate } from '@/shared/config/i18n'`.
- Доменные строки сессии живут под ключами `session.*` / `controls.*`; добавляя сущность — добавляй её ключи в `en.ts` (схема) и `ru.ts`.

## 8. Соглашения по коду
- **Именование TS:** `type` → префикс **T** (`TPlatformName`), `interface` → **I** (`IPlatform`), `enum` → **E** (`ESessionMode`).
- Vue — только `<script setup lang="ts">`.
- Path-алиас `@` → `src` (в `vite.config.ts` и `tsconfig.app.json`).
- shadcn-vue ставит компоненты в `@/shared/ui` (см. `components.json`).
- Слайс экспортирует публичный API через `index.ts` (barrel); снаружи импортируем из barrel, не из внутренностей.

## 9. Команды
```bash
bun install        # зависимости
bun run dev        # dev-сервер (web) на :5173
bun run build      # vue-tsc -b && vite build (typecheck + прод-сборка)
bun run preview    # предпросмотр прод-сборки
bun run tauri:dev  # desktop-окно (Tauri) — грузит dev-сервер :5173
bun run tauri:build # desktop-инсталляторы (AppImage/.deb/.rpm/…)
bun run cap:sync   # пересобрать web-бандл в нативные проекты (после bun run build)
bunx cap run android # запуск на устройстве/эмуляторе (нужен Android SDK)
```

**Предусловия desktop (Tauri):** Rust (rustup, стоит в `~/.cargo`) + системные dev-библиотеки. Ubuntu 24.04:
```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev pkg-config
```
Перед `tauri` командами: `source $HOME/.cargo/env`.

**Предусловия mobile (Capacitor):** Android — JDK 21 + Android Studio/SDK (`ANDROID_HOME`), затем `bun run build && bunx cap sync android && bunx cap run android`. iOS — только на macOS: `bunx cap add ios` + Xcode + CocoaPods.

## 10. Статус по этапам (см. PLAN.md)
- [x] Шаг 0 — план сохранён (PLAN.md + память)
- [x] Шаг 1 — каркас: Vite+Vue+TS, FSD-скелет, Tailwind v4, shadcn-vue конфиг, Pinia/Router, `shared/platform` (web). Сборка/typecheck/dev — зелёные.
- [x] Шаг 2 — таймер MVP: `entities/session` (Pinia-движок: 3 режима, цикл 4→длинный, chime, уведомления, персистентность настроек), `widgets/timer-ring`, `features/timer-control`; i18n (en/ru). Build/typecheck — зелёные.
- [x] Шаг 3 — темы: `shared/config/themes` (токены+генерация CSS), `entities/theme` (стор: цвет-тема + light/dark/system, персист, применение к `<html>`), `features/theme-switch` (ThemeSwitcher), i18n `theme.*`. 4 темы (1 премиум-заглушка). Build/typecheck — зелёные.
- [~] Шаг 4 — Tauri (desktop): `src-tauri` (Tauri 2), плагины store/notification/single-instance, tray-меню + close-to-tray, mini-mode (`set_mini` + `platform.window`), адаптер `platform/tauri`, runtime-детект, vite под tauri. TS/web-build — зелёные. **Rust-компиляция и `tauri dev`/`build` не проверены** — нужны системные dev-библиотеки (см. предусловия §9, требуют `sudo`). Auto-updater отложен на шаг 9 (нужны ключи подписи + GitHub Releases).
- [x] Шаг 5 — Capacitor (mobile, Android): `capacitor.config.ts`, нативный `android/`, адаптер `platform/capacitor` (preferences/local-notifications/haptics), `IHapticsAdapter`, детект `Capacitor.isNativePlatform()`, haptics в `finishSession`. **Android APK собран и проверен** (`gradlew assembleDebug` → `app-debug.apk`, JDK21+SDK35 в `~/jdk-21`/`~/Android/Sdk`, env: `source ~/android-env.sh`). `ios/` не создан — нужен macOS/Xcode.
- [ ] Шаг 6 — Supabase (auth + sync)
- [ ] Шаг 7 — tasks
- [ ] Шаг 8 — подписка
- [ ] Шаг 9 — релиз (новый GitHub-репо + CI)
