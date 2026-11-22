import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useFilters } from './useFilters'
import { startOfDayUTC, endOfDayUTC } from '@/lib/dates'
import { CRM_TABLE } from '@/lib/tables'

export interface LeadRow {
  id: string
  date: string
  name: string
  number: string
  email: string
  kit: string
  utm_source: string
  recoveredValue: number
}

const PER_PAGE = 20

function parseNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  let s = String(val).replace(/[^0-9.,\-]/g, '')
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.')
  }
  const n = parseFloat(s)
  return isNaN(n) ? 0 : n
}

export function useLeads(search: string, page: number) {
  const { dateFrom, dateTo, kit } = useFilters()
  const [rows, setRows] = useState<LeadRow[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const from = startOfDayUTC(dateFrom)
        const to = endOfDayUTC(dateTo)

        let q = supabase
          .from(CRM_TABLE)
          .select('id, created_at, name, number, email, kit, utm_source, "($)"')
          .gte('created_at', from)
          .lte('created_at', to)
          .eq('Event', 'order_paid')
          .like('utm_source', '%WPP%')
          .eq('upsell', false)
          .order('created_at', { ascending: false })
          .limit(200)

        if (kit !== 'Todos') q = q.eq('kit', kit)
        if (search) {
          q = q.or(
            `email.ilike.%${search}%,name.ilike.%${search}%,number.ilike.%${search}%`,
          )
        }

        const { data, error } = await q
        if (error) throw error

        const all = (data ?? []) as any[]
        setTotalPages(Math.max(1, Math.ceil(all.length / PER_PAGE)))

        const paged: LeadRow[] = all
          .slice((page - 1) * PER_PAGE, page * PER_PAGE)
          .map((r) => ({
            id: String(r.id),
            date: r.created_at,
            name: r.name ?? '—',
            number: r.number ?? '—',
            email: r.email ?? '—',
            kit: r.kit ?? '—',
            utm_source: r.utm_source ?? '',
            recoveredValue: parseNum(r['($)']),
          }))

        setRows(paged)
      } catch (e) {
        console.error(e)
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dateFrom, dateTo, search, page, kit])

  return { rows, totalPages, loading }
}
