'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, formatBytes } from '@/lib/utils'
import { ImageIcon, Film, Music, FileText } from 'lucide-react'

interface MediaCardProps {
  id: number
  title: string
  thumbnailUrl: string | null
  contentType: string
  creatorName: string
  createdAt: string
  /** For Published assets, the actual publish time — prefer this over createdAt when present. */
  publishedAt?: string | null
  fileSize?: number
  tags?: string[]
  href?: string
  className?: string
}

function ContentTypeIcon({ contentType, className }: { contentType: string; className?: string }) {
  if (contentType.startsWith('video/')) return <Film className={className} />
  if (contentType.startsWith('audio/')) return <Music className={className} />
  if (contentType.startsWith('image/')) return <ImageIcon className={className} />
  return <FileText className={className} />
}

function getContentTypeLabel(contentType: string): string {
  if (contentType.startsWith('video/')) return 'Video'
  if (contentType.startsWith('audio/')) return 'Audio'
  if (contentType.startsWith('image/')) return 'Image'
  return 'Document'
}

export function MediaCard({
  id,
  title,
  thumbnailUrl,
  contentType,
  creatorName,
  createdAt,
  publishedAt,
  fileSize,
  tags,
  href,
  className
}: MediaCardProps) {
  const typeLabel = getContentTypeLabel(contentType)
  const linkHref = href ?? `/catalog/${id}`
  const displayDate = publishedAt ?? createdAt

  return (
    <Link href={linkHref} className={cn('group block', className)}>
      <div className="overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10 border transition-colors hover:border-foreground/20">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ContentTypeIcon contentType={contentType} className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 text-[10px] font-medium uppercase tracking-wider"
          >
            {typeLabel}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-1.5 p-3">
          <h3 className="line-clamp-1 text-sm font-medium leading-tight group-hover:underline">{title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{creatorName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(displayDate)}</p>
          </div>
          {fileSize !== undefined && (
            <p className="text-[10px] font-mono text-muted-foreground">{formatBytes(fileSize)}</p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
