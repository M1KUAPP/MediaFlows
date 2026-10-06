'use client'

import { useState, useCallback } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { cn } from '@/lib/utils'
import { FileImage, FileVideo, FileAudio, FileText } from 'lucide-react'

interface MediaPlayerProps {
  src: string
  contentType: string
  title: string
  thumbnailUrl?: string | null
  className?: string
}

function getMediaType(contentType: string): 'video' | 'audio' | 'image' | 'pdf' | 'other' {
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('audio/')) return 'audio'
  if (contentType.startsWith('image/')) return 'image'
  if (contentType === 'application/pdf') return 'pdf'
  return 'other'
}

function MediaTypeIcon({ contentType, className }: { contentType: string; className?: string }) {
  if (contentType.startsWith('image/')) return <FileImage className={className} />
  if (contentType.startsWith('video/')) return <FileVideo className={className} />
  if (contentType.startsWith('audio/')) return <FileAudio className={className} />
  return <FileText className={className} />
}

export function MediaPlayer({ src, contentType, title, thumbnailUrl, className }: MediaPlayerProps) {
  const mediaType = getMediaType(contentType)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleImageClick = useCallback(() => {
    setLightboxOpen(true)
  }, [])

  if (!src) {
    return (
      <div className={cn('flex aspect-video w-full items-center justify-center bg-muted rounded-md border', className)}>
        <MediaTypeIcon contentType={contentType} className="h-12 w-12 text-muted-foreground/40" />
      </div>
    )
  }

  if (mediaType === 'image') {
    return (
      <>
        <div
          className={cn('group relative cursor-zoom-in overflow-hidden rounded-md border bg-muted', className)}
          onClick={handleImageClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleImageClick()
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the media URL (CDN, S3 or the API media route) is used as-is; next/image would route it through /_next/image */}
          <img
            src={src}
            alt={title}
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5 dark:group-hover:bg-white/5" />
        </div>
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src, alt: title }]}
          carousel={{ finite: true }}
          render={{
            buttonPrev: () => null,
            buttonNext: () => null
          }}
        />
      </>
    )
  }

  if (mediaType === 'audio') {
    return (
      <div className={cn('w-full', className)}>
        <div className="rounded-md border bg-muted p-6">
          <p className="mb-3 text-sm font-medium">{title}</p>
          <audio controls className="w-full" preload="metadata">
            <source src={src} type={contentType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    )
  }

  if (mediaType === 'video') {
    return (
      <div className={cn('aspect-video w-full overflow-hidden rounded-md border bg-black', className)}>
        <video controls className="h-full w-full" preload="metadata" poster={thumbnailUrl ?? undefined}>
          <source src={src} type={contentType} />
          Your browser does not support the video element.
        </video>
      </div>
    )
  }

  if (mediaType === 'pdf') {
    return (
      <div className={cn('w-full overflow-hidden rounded-md border', className)}>
        <iframe src={src} title={title} className="h-[75vh] w-full" />
      </div>
    )
  }

  // Unsupported type fallback
  return (
    <div className={cn('flex aspect-video w-full items-center justify-center bg-muted rounded-md border', className)}>
      <div className="text-center">
        <MediaTypeIcon contentType={contentType} className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">Preview not available</p>
      </div>
    </div>
  )
}
