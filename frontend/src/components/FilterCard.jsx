import React from 'react'
import { SlidersHorizontal } from 'lucide-react'

export const defaultJobFilters = { posted: 'any', salary: 'any', experience: 'any', jobType: 'any', workMode: 'any' }

const filterGroups = [
    { key: 'posted', title: 'Date posted', options: [['any', 'All days'], ['today', 'Today'], ['3', 'Last 3 days'], ['7', 'Last 7 days']] },
    { key: 'salary', title: 'Minimum salary', options: [['any', 'Any salary'], ['200000', '₹2,00,000+'], ['300000', '₹3,00,000+'], ['500000', '₹5,00,000+'], ['700000', '₹7,00,000+'], ['900000', '₹9,00,000+'], ['1300000', '₹13,00,000+']] },
    { key: 'experience', title: 'Work experience', options: [['any', 'Any experience'], ['0', 'No experience'], ['1', '1+ year'], ['3', '3+ years'], ['5', '5+ years']] },
    { key: 'jobType', title: 'Job type', options: [['any', 'Any type'], ['full-time', 'Full-time'], ['part-time', 'Part-time']] },
    { key: 'workMode', title: 'Work mode', options: [['any', 'Any mode'], ['on-site', 'On-site'], ['remote', 'Remote'], ['hybrid', 'Hybrid'], ['temporarily remote', 'Temporarily remote']] },
]

const FilterCard = ({ filters = defaultJobFilters, onChange = () => {} }) => (
    <aside className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-border pb-4"><SlidersHorizontal className="size-4 text-primary" /><h2 className="font-semibold">Filters</h2></div>
        <div className="space-y-5">
            {filterGroups.map(group => <label className="block" key={group.key}>
                <span className="mb-2 block text-sm font-semibold">{group.title}</span>
                <select value={filters[group.key]} onChange={event => onChange({ ...filters, [group.key]: event.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {group.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </label>)}
        </div>
        <button type="button" onClick={() => onChange(defaultJobFilters)} className="mt-5 text-sm font-medium text-primary hover:underline">Clear all filters</button>
    </aside>
)

export default FilterCard
