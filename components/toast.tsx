import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "rounded-md px-4 py-2 text-sm font-medium shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900",
        success: "bg-green-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string
}

export function Toast({ className, title, variant, ...props }: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      {title}
    </div>
  )
}

