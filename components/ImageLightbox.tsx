import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"

interface ImageLightboxProps {
  isOpen: boolean
  onClose: () => void
  images: Array<{ src: string; alt: string }>
  title?: string
  description?: string
  dialogTitle?: string
}

export function ImageLightbox({ 
  isOpen, 
  onClose, 
  images,
  title,
  description,
  dialogTitle 
}: ImageLightboxProps) {
  // Use the first image if multiple are provided
  const currentImage = images[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-2xl w-[100vw] h-[100vh] p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Header with title and description */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur p-4">
          {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </div>
        
        {/* Scrollable container with both horizontal and vertical scroll */}
        <div className="w-full h-full overflow-auto touch-pan-x touch-pan-y overscroll-none">
          <div className="min-h-full min-w-full w-fit flex items-center justify-center p-4 pt-20">
            <img
              src={currentImage.src}
              alt={currentImage.alt || title || 'Image'}
              className="w-auto max-w-[140vw] h-auto max-h-[140vh] cursor-zoom-out rounded-md object-contain"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                touchAction: 'pan-x pan-y', // Enable touch panning in both directions
                transform: 'scale(1.4)', // Initial zoom level
                transformOrigin: 'center center',
              }}
            />
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background/90 transition-colors"
          aria-label="Close lightbox"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </DialogContent>
    </Dialog>
  )
} 