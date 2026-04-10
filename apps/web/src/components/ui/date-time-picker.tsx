"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date & time",
  disabled,
  minDate,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    if (value) {
      const h = value.getHours().toString().padStart(2, "0")
      const m = value.getMinutes().toString().padStart(2, "0")
      return `${h}:${m}`
    }
    return "00:00"
  })

  const handleSelectDate = (day: Date | undefined) => {
    if (!day) {
      onChange?.(undefined)
      return
    }
    const [hours, minutes] = timeValue.split(":").map(Number)
    const newDate = new Date(day)
    newDate.setHours(hours, minutes, 0, 0)
    onChange?.(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setTimeValue(time)
    if (value && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(value)
      newDate.setHours(hours, minutes, 0, 0)
      onChange?.(newDate)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {value ? (
            value.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + " " + timeValue
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelectDate}
          disabled={(date) =>
            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
            (minDate ? date < minDate : false)
          }
          autoFocus
        />
        <div className="border-t px-3 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground w-10 shrink-0">Time</label>
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
