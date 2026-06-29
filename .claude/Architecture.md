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
│  └─ timer-control/     # табы режимов + start/pause/reset/skip
├─ entities/             # бизнес-сущности
│  └─ session/           # домен сессии: model/{types,session.store} + index (barrel)
└─ shared/               # переиспользуемое, без бизнес-логики
   ├─ ui/                # shadcn-vue компоненты + свой дизайн-кит
   ├─ api/               # Supabase-клиент, data-access (позже)
   ├─ lib/               # utils.ts (cn), format.ts (mm:ss), chime.ts (WebAudio)
   ├─ config/
   │  ├─ i18n/           # createI18n + locales/{en,ru} + translate() для сторов
   │  └─ themes/         # токены тем (шаг 3)
   └─ platform/          # ★ адаптер платформ
      ├─ types.ts        # IPlatform, IStorageAdapter, INotificationsAdapter, TPlatformName
      ├─ index.ts        # resolvePlatform() → активная платформа
      ├─ web/            # реализация для браузера (готово)
      ├─ tauri/          # (заглушка, шаг 4)
      └─ capacitor/      # (заглушка, шаг 5)
```

**Правила FSD:** зависимости только «вниз» (`app → pages → widgets → features → entities → shared`). Слой не импортирует соседа того же уровня и ничего «вверх». Кросс-платформенные различия — только через `shared/platform`, фичи остаются платформо-независимыми.

## 5. Слой `shared/platform`
Интерфейсы + реализации на платформу, выбор в `index.ts` (сейчас всегда web; позже runtime-детект `window.__TAURI__` / Capacitor global).
- `storage` — `get/set/remove` (web: localStorage; tauri: Store; capacitor: Preferences)
- `notifications` — `ensurePermission/notify` (web: Notification API)
- *(позже)* `tray`/mini-mode — только desktop, на остальных no-op
- *(позже)* `haptics` — mobile
- *(позже)* `purchase` — Stripe (web/desktop) vs IAP (mobile)

## 6. Темизация
- Токены — CSS-переменные в `src/style.css`: `:root` (light) и `.dark`. Совместимы с shadcn-vue (`--background`, `--primary`, …). Brand-primary — коралловый `#ff6f61`.
- `@theme inline` маппит переменные в Tailwind-утилиты → и утилиты, и shadcn-компоненты тема-зависимы.
- Кастомные темы (шаг 3) будут TS-объектами в `shared/config/themes`, переключаются через `:root[data-theme=...]`; премиум-темы гейтятся подпиской.

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
# desktop/mobile добавятся на шагах 4–5 (tauri dev, cap run …)
```

## 10. Статус по этапам (см. PLAN.md)
- [x] Шаг 0 — план сохранён (PLAN.md + память)
- [x] Шаг 1 — каркас: Vite+Vue+TS, FSD-скелет, Tailwind v4, shadcn-vue конфиг, Pinia/Router, `shared/platform` (web). Сборка/typecheck/dev — зелёные.
- [x] Шаг 2 — таймер MVP: `entities/session` (Pinia-движок: 3 режима, цикл 4→длинный, chime, уведомления, персистентность настроек), `widgets/timer-ring`, `features/timer-control`; i18n (en/ru). Build/typecheck — зелёные.
- [ ] Шаг 3 — темы
- [ ] Шаг 4 — Tauri (desktop)
- [ ] Шаг 5 — Capacitor (mobile)
- [ ] Шаг 6 — Supabase (auth + sync)
- [ ] Шаг 7 — tasks
- [ ] Шаг 8 — подписка
- [ ] Шаг 9 — релиз (новый GitHub-репо + CI)
