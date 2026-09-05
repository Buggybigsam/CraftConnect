import Image from "next/image"

import { cn } from "@/lib/utils"

type BrandIconProps = {
  className?: string
  imageClassName?: string
  priority?: boolean
}

export default function BrandIcon({
  className,
  imageClassName,
  priority = false,
}: BrandIconProps) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src="/images/craftconnect-icon.png"
        alt=""
        fill
        priority={priority}
        sizes="40px"
        className={cn("object-contain", imageClassName)}
      />
    </span>
  )
}
