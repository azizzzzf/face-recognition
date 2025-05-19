import * as React from "react"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  className?: string
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = "",
  ...props
}: SliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Number(event.target.value))
  }

  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
      className={`w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none 
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white 
                ${className}`}
      {...props}
    />
  )
} 