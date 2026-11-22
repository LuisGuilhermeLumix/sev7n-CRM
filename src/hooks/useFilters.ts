import { create } from 'zustand'
import { todayStr, daysAgoStr, firstOfMonthStr } from '@/lib/dates'

export type RangeKey = 'hoje' | 'ontem' | '7d' | 'mes' | 'custom'

export type KitFilter = 'Todos' | 'Kit 1' | 'Kit 2' | 'Kit 3'

interface FiltersState {
  dateFrom: string
  dateTo: string
  kit: KitFilter
  activeRange: RangeKey
  setKit: (v: KitFilter) => void
  setRange: (key: Exclude<RangeKey, 'custom'>) => void
  applyCustom: (from: string, to: string) => void
}

export const useFilters = create<FiltersState>((set) => ({
  dateFrom: firstOfMonthStr(),
  dateTo: todayStr(),
  kit: 'Todos',
  activeRange: 'mes',

  setKit: (v) => set({ kit: v }),

  applyCustom: (from, to) =>
    set({
      dateFrom: from,
      dateTo: to,
      activeRange: 'custom',
    }),

  setRange: (key) => {
    let from: string
    let to: string = todayStr()

    if (key === 'hoje') {
      from = todayStr()
    } else if (key === 'ontem') {
      from = daysAgoStr(1)
      to = daysAgoStr(1)
    } else if (key === '7d') {
      from = daysAgoStr(6)
    } else {
      from = firstOfMonthStr()
    }

    set({ dateFrom: from, dateTo: to, activeRange: key })
  },
}))
