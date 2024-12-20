import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StickyNote } from 'lucide-react'

interface NoteDialogProps {
  initialNote: string
  isUrgent: boolean
  onSave: (note: string, isUrgent: boolean) => void
}

export function NoteDialog({ initialNote, isUrgent, onSave }: NoteDialogProps) {
  const [note, setNote] = useState(initialNote)
  const [urgent, setUrgent] = useState(isUrgent)

  const handleSave = () => {
    onSave(note, urgent)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <StickyNote className="w-4 h-4 mr-2" />
          Add/Edit Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add/Edit Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your note here..."
              className="h-32"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="urgent-mode"
              checked={urgent}
              onCheckedChange={setUrgent}
            />
            <Label htmlFor="urgent-mode">Urgent</Label>
          </div>
        </div>
        <Button onClick={handleSave}>Save Note</Button>
      </DialogContent>
    </Dialog>
  )
}

