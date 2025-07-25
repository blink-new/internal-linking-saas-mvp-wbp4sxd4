import React, { useEffect, useRef } from 'react';
import Shepherd from 'shepherd.js';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

interface ShepherdTourProps {
  onComplete?: () => void;
}

export const ShepherdTour: React.FC<ShepherdTourProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const tourRef = useRef<Shepherd.Tour | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check if user has completed the tour
    const checkTourStatus = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('tour_completed')
        .eq('user_id', user.id)
        .single();

      if (data?.tour_completed) return;

      // Initialize tour
      const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'shepherd-theme-custom',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: {
            enabled: true,
          },
        },
      });

      // Step 1: Welcome
      tour.addStep({
        title: 'Welcome to Internal Linking SaaS! 🎉',
        text: `
          <div class="space-y-3">
            <p>Let's take a quick tour to get you started with automating your internal linking workflow.</p>
            <p class="text-sm text-muted-foreground">This will only take 2 minutes.</p>
          </div>
        `,
        buttons: [
          {
            text: 'Skip Tour',
            classes: 'btn btn-secondary',
            action: () => tour.cancel(),
          },
          {
            text: 'Start Tour',
            classes: 'btn btn-primary',
            action: () => tour.next(),
          },
        ],
      });

      // Step 2: Create Project Button
      tour.addStep({
        title: 'Create Your First Project',
        text: `
          <div class="space-y-3">
            <p>Start by creating a project for your website. Each project represents a site you want to optimize with internal links.</p>
            <p class="text-sm text-muted-foreground">Click this button to create your first project.</p>
          </div>
        `,
        attachTo: {
          element: '[data-tour="create-project"]',
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Previous',
            classes: 'btn btn-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Next',
            classes: 'btn btn-primary',
            action: () => tour.next(),
          },
        ],
      });

      // Step 3: Quota Bar
      tour.addStep({
        title: 'Monitor Your Usage',
        text: `
          <div class="space-y-3">
            <p>Keep track of your monthly job usage here. Each article you process counts as one job.</p>
            <p class="text-sm text-muted-foreground">Free plan includes 10 jobs per month.</p>
          </div>
        `,
        attachTo: {
          element: '[data-tour="quota-bar"]',
          on: 'bottom',
        },
        buttons: [
          {
            text: 'Previous',
            classes: 'btn btn-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Next',
            classes: 'btn btn-primary',
            action: () => tour.next(),
          },
        ],
      });

      // Step 4: How it works
      tour.addStep({
        title: 'How It Works',
        text: `
          <div class="space-y-3">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <p class="text-sm">Create a project with your website URL and cornerstone keywords sheet</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <p class="text-sm">Add Google Doc articles to process</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <p class="text-sm">Our AI automatically adds contextual internal links</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
              <p class="text-sm">Review changes and download the optimized document</p>
            </div>
          </div>
        `,
        buttons: [
          {
            text: 'Previous',
            classes: 'btn btn-secondary',
            action: () => tour.back(),
          },
          {
            text: 'Get Started',
            classes: 'btn btn-primary',
            action: () => tour.complete(),
          },
        ],
      });

      // Tour event handlers
      tour.on('complete', async () => {
        // Mark tour as completed
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            tour_completed: true,
          });
        
        onComplete?.();
      });

      tour.on('cancel', async () => {
        // Mark tour as completed even if cancelled
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            tour_completed: true,
          });
      });

      tourRef.current = tour;
      tour.start();
    };

    checkTourStatus();

    return () => {
      if (tourRef.current) {
        tourRef.current.complete();
      }
    };
  }, [user, onComplete]);

  return null;
};

// Add custom CSS for Shepherd tour
export const ShepherdTourStyles = () => (
  <style jsx global>{`
    .shepherd-theme-custom {
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid hsl(var(--border));
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }

    .shepherd-theme-custom .shepherd-header {
      padding: 16px 20px 0;
    }

    .shepherd-theme-custom .shepherd-title {
      font-size: 16px;
      font-weight: 600;
      color: hsl(var(--foreground));
      margin: 0;
    }

    .shepherd-theme-custom .shepherd-text {
      padding: 12px 20px;
      font-size: 14px;
      line-height: 1.5;
      color: hsl(var(--muted-foreground));
    }

    .shepherd-theme-custom .shepherd-footer {
      padding: 0 20px 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .shepherd-theme-custom .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .shepherd-theme-custom .btn-primary {
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }

    .shepherd-theme-custom .btn-primary:hover {
      background: hsl(var(--primary) / 0.9);
    }

    .shepherd-theme-custom .btn-secondary {
      background: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
    }

    .shepherd-theme-custom .btn-secondary:hover {
      background: hsl(var(--secondary) / 0.8);
    }

    .shepherd-modal-overlay-container {
      background: rgba(0, 0, 0, 0.4);
    }

    .shepherd-element {
      z-index: 9999;
    }
  `}</style>
);