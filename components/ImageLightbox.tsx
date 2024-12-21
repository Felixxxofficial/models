import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface ImageLightboxProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
}

export function ImageLightbox({ isOpen, onClose, imageUrl }: ImageLightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-lg w-full p-0 bg-transparent border-none">
        <div className="relative w-full h-[90vh] flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Full size"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 