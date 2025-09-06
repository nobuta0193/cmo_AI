import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "./badge"
import { Button } from "./button"
import { Input } from "./input"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  onAddNewTag?: (tag: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TagInput({
  value = [],
  onChange,
  onAddNewTag,
  placeholder = "タグを入力...",
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault()
      if (onAddNewTag) {
        onAddNewTag(inputValue)
      }
      if (!value.includes(inputValue)) {
        onChange([...value, inputValue])
      }
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-sm">
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => removeTag(tag)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )
}
