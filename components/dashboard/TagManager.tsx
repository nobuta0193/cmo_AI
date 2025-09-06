import { useEffect, useState } from "react"
import { TagInput } from "../ui/tag-input"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { toast } from "sonner"

interface Tag {
  id: string
  name: string
}

interface TagManagerProps {
  initialTags?: string[]
  onTagsChange?: (tags: string[]) => void
}

export function TagManager({ initialTags = [], onTagsChange }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [isOpen, setIsOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags")
      if (!response.ok) throw new Error("タグの取得に失敗しました")
      const data = await response.json()
      setAvailableTags(data)
    } catch (error) {
      console.error("タグの取得に失敗しました:", error)
      toast.error("タグの取得に失敗しました")
    }
  }

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
    onTagsChange?.(newTags)
  }

  const handleAddNewTag = async (tag: string) => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: tag }),
      })

      if (!response.ok) throw new Error("タグの追加に失敗しました")
      
      const newTag = await response.json()
      setAvailableTags([...availableTags, newTag])
      toast.success(`新しいタグ「${tag}」を追加しました`)
    } catch (error) {
      toast.error("タグの追加に失敗しました")
      console.error(error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">タグを管理</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>タグの管理</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <TagInput
            value={tags}
            onChange={handleTagsChange}
            onAddNewTag={handleAddNewTag}
            placeholder="新しいタグを入力してEnterを押してください"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
