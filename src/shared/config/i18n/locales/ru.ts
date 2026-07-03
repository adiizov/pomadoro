import type { TMessageSchema } from './en'

export const ru: TMessageSchema = {
  session: {
    title: 'Помодоро',
    mode: {
      focus: 'Фокус',
      short: 'Короткий перерыв',
      long: 'Длинный перерыв',
    },
    phase: {
      focus: 'Время сосредоточиться',
      short: 'Короткий перерыв',
      long: 'Расслабься, длинный перерыв',
    },
    done: {
      focus: 'Фокус завершён — пора на перерыв',
      short: 'Перерыв окончен — снова к фокусу',
      long: 'Длинный перерыв окончен — снова к фокусу',
    },
  },
  controls: {
    start: 'Старт',
    pause: 'Пауза',
    resume: 'Продолжить',
    reset: 'Сброс',
    skip: 'Пропустить',
  },
  theme: {
    names: {
      coral: 'Коралл',
      ocean: 'Океан',
      forest: 'Лес',
      grape: 'Виноград',
    },
    mode: {
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная',
    },
  },
  window: {
    mini: 'Мини-режим',
    exit: 'Выйти из мини-режима',
  },
}
