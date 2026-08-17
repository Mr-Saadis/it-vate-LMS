import { Calendar } from 'lucide-react'
import { format, parseISO, eachMonthOfInterval, isSameMonth } from 'date-fns'

export interface CohortInfo {
  content_items_id: string
  courseName: string
  levelTitle: string
  batchId: string
  startDate: string
  endDate: string
  hue: number
}

interface UpcomingCohortsProps {
  cohorts: CohortInfo[]
}

export function UpcomingCohorts({ cohorts }: UpcomingCohortsProps) {
  if (!cohorts || cohorts.length === 0) return null

  // 1. Group cohorts by Course
  const courseNames = Array.from(new Set(cohorts.map(c => c.courseName)))
  const courseGroups = courseNames.map(course => ({
    courseName: course,
    hue: cohorts.find(c => c.courseName === course)?.hue || 0,
    cohorts: cohorts.filter(c => c.courseName === course)
  }))

  // 2. Determine Timeline Months
  const startDates = cohorts.map(c => parseISO(c.startDate))
  const endDates = cohorts.map(c => parseISO(c.endDate))
  
  const minDate = new Date(Math.min(...startDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())))
  
  // Calculate months. If there's only one cohort, minDate and maxDate might be in the same month.
  // Ensure we at least show a 3-month window if maxDate is very close.
  let months = eachMonthOfInterval({ start: minDate, end: maxDate })
  if (months.length === 1) {
    months = eachMonthOfInterval({ 
      start: minDate, 
      end: new Date(minDate.getFullYear(), minDate.getMonth() + 2, 1) 
    })
  } else if (months.length > 6) {
    // Limit to 6 months max to avoid horizontal sprawl
    months = months.slice(0, 6)
  }

  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-4 md:px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F18231]/10 border border-[#F18231]/25 shadow-sm">
            <Calendar className="h-5 w-5 text-[#F18231]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F18231] mb-0.5">Live Sessions</p>
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight leading-tight">Upcoming Cohorts</h2>
            <p className="text-sm text-slate-500 mt-0.5">Browse the schedule for upcoming live batch sessions.</p>
          </div>
        </div>

        {/* Timeline Table View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-lg bg-white" style={{ boxShadow: '0 4px 24px 0 rgba(15,23,42,0.08), 0 1px 4px 0 rgba(241,130,49,0.07)' }}>
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-extrabold text-[#F18231] uppercase tracking-widest w-[280px] border-r border-slate-200 bg-[#F18231]/6">
                  Course
                </th>
                {months.map(month => (
                  <th
                    key={month.toISOString()}
                    className="px-4 py-4 text-center text-[11px] font-extrabold text-[#1e3a5f] uppercase tracking-widest border-r border-slate-200 last:border-r-0 min-w-[210px] bg-[#0F172A]/[0.03]"
                  >
                    {format(month, 'MMMM yyyy')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courseGroups.map((group) => (
                <tr key={group.courseName} className="border-b border-slate-100 last:border-b-0 hover:bg-[#0F172A]/[0.02] transition-colors duration-150">

                  {/* Column 1: Course Name */}
                  <td className="px-6 py-5 border-r border-slate-100 bg-[#F18231]/[0.03] align-middle">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                      {group.courseName}
                    </h3>
                  </td>

                  {/* Columns for Months */}
                  {months.map(month => {
                    const monthCohorts = group.cohorts.filter(c => isSameMonth(parseISO(c.startDate), month))

                    return (
                      <td key={month.toISOString()} className="p-3 border-r border-slate-100 last:border-r-0 align-top">
                        <div className="flex flex-col gap-2.5">
                          {monthCohorts.map(cohort => {
                            const isSameMonthEnd = isSameMonth(parseISO(cohort.startDate), parseISO(cohort.endDate))

                            return (
                              <div
                                key={cohort.content_items_id}
                                className="relative rounded-xl p-3.5 border border-slate-200/80 border-l-[3px] border-l-[#F18231] cursor-pointer group overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                  background: 'linear-gradient(135deg, #ffffff 60%, rgba(15,23,42,0.03) 100%)',
                                  boxShadow: '0 1px 4px 0 rgba(15,23,42,0.07), 0 1px 8px 0 rgba(241,130,49,0.06)'
                                }}
                              >
                                {/* Navy top-right accent dot */}
                                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#1e3a5f]/30 group-hover:bg-[#F18231]/70 transition-colors duration-200" />

                                {/* Level Title */}
                                <div className="text-xs font-bold text-[#0F172A] mb-1 pr-3 leading-tight group-hover:text-[#F18231] transition-colors duration-150">
                                  {cohort.levelTitle}
                                </div>

                                {/* Batch ID — navy tint */}
                                <div className="text-[10px] uppercase font-mono tracking-widest mb-2.5 text-[#1e3a5f]/50 font-semibold">
                                  {cohort.batchId}
                                </div>

                                {/* Date Badge — navy bg with orange icon */}
                                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-lg px-2 py-1 border" style={{ background: 'rgba(15,23,42,0.05)', borderColor: 'rgba(15,23,42,0.10)', color: '#1e3a5f' }}>
                                  <Calendar className="h-3 w-3 text-[#F18231]" />
                                  <span>
                                    {isSameMonthEnd
                                      ? `${format(parseISO(cohort.startDate), 'MMM d')} – ${format(parseISO(cohort.endDate), 'd')}`
                                      : `${format(parseISO(cohort.startDate), 'MMM d')} – ${format(parseISO(cohort.endDate), 'MMM d')}`
                                    }
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
