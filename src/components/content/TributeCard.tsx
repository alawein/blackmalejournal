import Image from "next/image"

interface TributeCardProps {
  name: string
  honorific?: string
  dates: string
  imageUrl?: string
  description?: string
}

export default function TributeCard({
  name,
  honorific,
  dates,
  imageUrl,
  description,
}: TributeCardProps) {
  return (
    <div className="flex flex-col overflow-hidden sm:flex-row">
      <div className="relative h-48 w-full bg-bmj-brown sm:h-auto sm:w-2/5">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="halftone-heavy object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center border-bmj-red bg-bmj-black p-6 sm:border-l-[3px] sm:p-8">
        <span className="font-label text-xs uppercase tracking-label text-bmj-tan">
          In Memoriam
        </span>
        {honorific && (
          <span className="mt-2 font-body text-sm italic text-bmj-tan">
            {honorific}
          </span>
        )}
        <h3 className="mt-1 font-display text-2xl uppercase tracking-display text-bmj-white sm:text-3xl">
          {name}
        </h3>
        <div className="mt-3 h-px w-full bg-bmj-tan/30" />
        <span className="mt-2 font-mono text-xs text-bmj-tan">{dates}</span>
        {description && (
          <p className="mt-4 font-body text-sm leading-relaxed text-bmj-cream/80">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
