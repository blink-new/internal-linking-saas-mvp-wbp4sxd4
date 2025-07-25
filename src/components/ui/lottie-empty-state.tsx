import React from 'react';
import Lottie from 'lottie-react';

// Simple animation data for empty states
const emptyProjectsAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Empty Projects",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Folder",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [80, 60] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 8 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.8, 0.8, 0.8, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

const emptyJobsAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Empty Jobs",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Document",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [60, 80] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 4 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.9, 0.9, 0.9, 1] },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 90,
      st: 0
    }
  ]
};

interface LottieEmptyStateProps {
  type: 'projects' | 'jobs';
  className?: string;
  size?: number;
}

export const LottieEmptyState: React.FC<LottieEmptyStateProps> = ({
  type,
  className = '',
  size = 120,
}) => {
  const animationData = type === 'projects' ? emptyProjectsAnimation : emptyJobsAnimation;

  return (
    <div className={`flex justify-center ${className}`}>
      <Lottie
        animationData={animationData}
        style={{ width: size, height: size }}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};