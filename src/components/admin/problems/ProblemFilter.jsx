import React, { useMemo, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

/**
 * ProblemFilter — slide-in sidebar filter panel for ProblemManagement.
 *
 * Props:
 *  - currentFilter: { name, isActive, hasSolution, dateFrom, dateTo }
 *  - onFilterChange(filter): called when user clicks "Áp dụng"
 *  - onClose(): close the panel
 */
function ProblemFilter({ onFilterChange, onClose, currentFilter = {} }) {
  const getMappedFilters = (filterObj) => ({
    name: filterObj.name || '',
    isActive: filterObj.isActive === undefined ? 'all' : String(filterObj.isActive),
    hasSolution: filterObj.hasSolution === undefined ? 'all' : String(filterObj.hasSolution),
    dateFrom: filterObj.dateFrom || '',
    dateTo: filterObj.dateTo || '',
  })

  const [filters, setFilters] = useState(() => getMappedFilters(currentFilter))

  useEffect(() => {
    setFilters(getMappedFilters(currentFilter))
  }, [currentFilter])

  const set = (field, value) =>
    setFilters(prev => ({ ...prev, [field]: value }))

  const handleApply = () => {
    const out = {
      name: filters.name.trim() || '',
      isActive: filters.isActive === 'all' ? undefined : filters.isActive === 'true',
      hasSolution: filters.hasSolution === 'all' ? undefined : filters.hasSolution === 'true',
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }
    onFilterChange(out)
    onClose()
  }

  const handleReset = () => {
    const reset = { name: '', isActive: 'all', hasSolution: 'all', dateFrom: '', dateTo: '' }
    setFilters(reset)
    onFilterChange({ name: '', isActive: undefined, hasSolution: undefined, dateFrom: undefined, dateTo: undefined })
  }

  const activeCount = [
    filters.name,
    filters.isActive !== 'all' ? '1' : '',
    filters.hasSolution !== 'all' ? '1' : '',
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length

  return (
    <div className="bg-white dark:bg-slate-800 h-full flex flex-col shadow-2xl border-l dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold dark:text-white">Bộ lọc bài tập</h2>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
              {activeCount}
            </span>
          )}
        </div>
        <div className="hover:bg-gray-100 dark:hover:bg-slate-700 p-1.5 rounded-xl cursor-pointer">
          <X className="w-5 h-5 dark:text-slate-300" onClick={onClose} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto py-5 px-6 space-y-6">

        {/* Tên bài tập */}
        <div className="space-y-2">
          <Label htmlFor="pf-name" className="text-sm font-semibold dark:text-slate-200">
            Tên bài tập
          </Label>
          <Input
            id="pf-name"
            placeholder="Nhập tên hoặc từ khoá..."
            value={filters.name}
            onChange={e => set('name', e.target.value)}
            className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          />
        </div>

        {/* Giải pháp */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold dark:text-slate-200">Giải pháp (Solution)</Label>
          <Select value={filters.hasSolution} onValueChange={v => set('hasSolution', v)}>
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Đã có giải pháp</SelectItem>
              <SelectItem value="false">Chưa có giải pháp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trạng thái */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold dark:text-slate-200">Trạng thái</Label>
          <Select value={filters.isActive} onValueChange={v => set('isActive', v)}>
            <SelectTrigger className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="true">Hoạt động</SelectItem>
              <SelectItem value="false">Đã ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Khoảng thời gian tạo */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold dark:text-slate-200">Khoảng thời gian tạo</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 dark:text-slate-400">Từ ngày</span>
              <Input
                id="pf-dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={e => set('dateFrom', e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 text-sm"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 dark:text-slate-400">Đến ngày</span>
              <Input
                id="pf-dateTo"
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={e => set('dateTo', e.target.value)}
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 text-sm"
              />
            </div>
          </div>
          {filters.dateFrom && filters.dateTo && filters.dateTo < filters.dateFrom && (
            <p className="text-xs text-red-500">Ngày kết thúc phải sau ngày bắt đầu</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t dark:border-slate-700 flex gap-3">
        <Button
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          onClick={handleApply}
          disabled={
            !!(filters.dateFrom && filters.dateTo && filters.dateTo < filters.dateFrom)
          }
        >
          Áp dụng
        </Button>
        <Button
          variant="outline"
          className="flex-1 cursor-pointer dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          onClick={handleReset}
        >
          Đặt lại
        </Button>
      </div>
    </div>
  )
}

export default ProblemFilter
