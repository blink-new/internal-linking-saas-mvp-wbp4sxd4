import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UsageData {
  jobs_used: number;
  jobs_limit: number;
  percentage: number;
  plan_name: string;
  billing_period_start: string;
  billing_period_end: string;
}

interface QuotaBarProps {
  className?: string;
  showDetails?: boolean;
  'data-tour'?: string;
}

export const QuotaBar: React.FC<QuotaBarProps> = ({ 
  className = '', 
  showDetails = true,
  'data-tour': dataTour
}) => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase.rpc('current_usage');
      
      if (error) {
        console.error('Error fetching usage:', error);
        toast({
          title: "Error loading usage data",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        setUsage(data[0]);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (percentage: number) => {
    if (percentage >= 90) {
      return {
        color: 'bg-destructive',
        icon: AlertTriangle,
        variant: 'destructive' as const,
        message: 'Quota almost exceeded'
      };
    } else if (percentage >= 75) {
      return {
        color: 'bg-yellow-500',
        icon: AlertTriangle,
        variant: 'secondary' as const,
        message: 'Approaching quota limit'
      };
    } else {
      return {
        color: 'bg-primary',
        icon: CheckCircle,
        variant: 'default' as const,
        message: 'Within quota limits'
      };
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-2 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const statusConfig = getStatusConfig(usage.percentage);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={className} data-tour={dataTour}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Job Usage</span>
              <Badge variant={statusConfig.variant} className="text-xs">
                {usage.plan_name}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <StatusIcon className="h-3 w-3" />
              <span className="text-sm font-medium">
                {usage.jobs_used} / {usage.jobs_limit}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Progress 
              value={usage.percentage} 
              className="h-2"
              // Custom color based on usage
              style={{
                '--progress-background': statusConfig.color
              } as React.CSSProperties}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{usage.percentage}% used</span>
              <span>
                {usage.jobs_limit - usage.jobs_used} remaining
              </span>
            </div>
          </div>

          {showDetails && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Billing period:</span>
                <span>
                  {new Date(usage.billing_period_start).toLocaleDateString()} - {' '}
                  {new Date(usage.billing_period_end).toLocaleDateString()}
                </span>
              </div>
              {usage.percentage >= 75 && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                  <StatusIcon className="inline h-3 w-3 mr-1" />
                  {statusConfig.message}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};