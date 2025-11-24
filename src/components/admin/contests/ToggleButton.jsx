'use client'

import { Button } from '@/components/ui/button'
export default function ToggleButton({ label, icon, isActive, onClick }) {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      className={isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Button>
  )
}