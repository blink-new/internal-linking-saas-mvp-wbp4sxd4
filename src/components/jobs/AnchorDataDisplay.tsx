import React from 'react'
import { motion } from 'framer-motion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Database } from '@/lib/supabaseClient'
import { 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  Target, 
  Link as LinkIcon 
} from 'lucide-react'

type Job = Database['public']['Tables']['jobs']['Row']

interface AnchorDataDisplayProps {
  job: Job
}

interface AnchorData {
  slug: string
  phrase: string
  url?: string
}

export const AnchorDataDisplay: React.FC<AnchorDataDisplayProps> = ({ job }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  // Parse anchor data from linkLog (anchors field)
  const anchorData: AnchorData[] = React.useMemo(() => {
    if (!job.anchors || typeof job.anchors !== 'object') return []
    
    try {
      // Handle different possible structures of the anchors data
      if (Array.isArray(job.anchors)) {
        return job.anchors.map((anchor: any) => ({
          slug: anchor.slug || anchor.keyword || '',
          phrase: anchor.phrase || anchor.text || anchor.anchor_text || '',
          url: anchor.url || anchor.link || ''
        }))
      } else if (typeof job.anchors === 'object') {
        // If it's an object, try to extract anchor data
        const anchorsArray = job.anchors.anchors || job.anchors.links || []
        if (Array.isArray(anchorsArray)) {
          return anchorsArray.map((anchor: any) => ({
            slug: anchor.slug || anchor.keyword || '',
            phrase: anchor.phrase || anchor.text || anchor.anchor_text || '',
            url: anchor.url || anchor.link || ''
          }))
        }
      }
      return []
    } catch (error) {
      console.error('Error parsing anchor data:', error)
      return []
    }
  }, [job.anchors])

  // Don't show if job is not done or has no anchor data
  if (job.status !== 'done' || anchorData.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between p-2 h-auto"
        >
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">
              {job.anchors_n || anchorData.length} anchors added
            </span>
            {job.article_url && (
              <Badge variant="outline" className="text-xs">
                Published
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 space-y-3"
        >
          {/* Article URL if available */}
          {job.article_url && (
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Published Article
                </span>
                <a
                  href={job.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>View</span>
                </a>
              </div>
            </div>
          )}

          {/* Anchor list */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Added Anchors
              </span>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {anchorData.map((anchor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs bg-muted/20 rounded px-2 py-1"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {anchor.slug || `anchor-${index + 1}`}
                    </Badge>
                    <span className="truncate text-muted-foreground">
                      →
                    </span>
                    <span className="truncate font-medium">
                      {anchor.phrase || 'No phrase'}
                    </span>
                  </div>
                  {anchor.url && (
                    <a
                      href={anchor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />
          
          <div className="text-xs text-muted-foreground">
            Total: {job.anchors_n || anchorData.length} internal links added
          </div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  )
}