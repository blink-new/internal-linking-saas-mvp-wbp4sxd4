import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DownloadSnapshotsProps {
  originalDocUrl?: string | null;
  updatedDocUrl?: string | null;
  jobTitle: string;
}

export const DownloadSnapshots: React.FC<DownloadSnapshotsProps> = ({
  originalDocUrl,
  updatedDocUrl,
  jobTitle
}) => {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download started",
        description: `${filename} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!originalDocUrl && !updatedDocUrl) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Document Snapshots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {originalDocUrl && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Original Document</p>
                <p className="text-xs text-muted-foreground">Before processing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(originalDocUrl)}
                className="h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(originalDocUrl, `${jobTitle}-original.html`)}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
        
        {updatedDocUrl && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Updated Document</p>
                <p className="text-xs text-muted-foreground">After processing</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(updatedDocUrl)}
                className="h-8"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(updatedDocUrl, `${jobTitle}-updated.html`)}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};