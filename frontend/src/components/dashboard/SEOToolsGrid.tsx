import React from 'react';
import { cn } from '@utils/helpers';

interface SEOTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  href?: string;
}

interface SEOToolsGridProps {
  className?: string;
}

const SEOToolsGrid: React.FC<SEOToolsGridProps> = ({ className = '' }) => {
  const seoTools: SEOTool[] = [
    {
      id: 'linkedin-profile',
      name: 'LinkedIn Profile Optimization',
      description: 'Optimize your LinkedIn profile for better visibility',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      enabled: true,
      href: '/user/linkedin-optimization'
    },
    {
      id: 'google-maps',
      name: 'Google Maps SEO',
      description: 'Optimize your local business presence',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'social-profile',
      name: 'Social Media Profile SEO',
      description: 'Enhance your social profiles',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'social-post',
      name: 'Social Media Post SEO',
      description: 'Optimize your social content',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'youtube-channel',
      name: 'YouTube Channel SEO',
      description: 'Grow your YouTube presence',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'youtube-video',
      name: 'YouTube Video SEO',
      description: 'Optimize individual videos',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'article',
      name: 'Article SEO',
      description: 'Perfect your blog content',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'website',
      name: 'Website SEO',
      description: 'Complete website optimization',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      enabled: false
    },
    {
      id: 'product',
      name: 'Product SEO',
      description: 'Boost product visibility',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
        </svg>
      ),
      enabled: false
    }
  ];

  const handleToolClick = (tool: SEOTool) => {
    if (tool.enabled && tool.href) {
      // Navigate to the tool page
      window.location.href = tool.href;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your SEO Focus</h2>
        <p className="text-gray-600">Select the SEO tools you want to use to optimize your online presence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seoTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className={cn(
              'bg-white rounded-xl shadow-lg border-2 p-6 cursor-pointer transition-all duration-200',
              tool.enabled
                ? 'border-primary-200 hover:border-primary-300 hover:shadow-xl transform hover:-translate-y-1'
                : 'border-gray-200 opacity-60 cursor-not-allowed',
              tool.id === 'linkedin-profile' && tool.enabled
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                : ''
            )}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                'p-3 rounded-full',
                tool.enabled
                  ? tool.id === 'linkedin-profile'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-400'
              )}>
                {tool.icon}
              </div>

              <div className="space-y-2">
                <h3 className={cn(
                  'font-semibold text-lg',
                  tool.enabled ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {tool.name}
                </h3>
                <p className={cn(
                  'text-sm',
                  tool.enabled ? 'text-gray-600' : 'text-gray-400'
                )}>
                  {tool.description}
                </p>
              </div>

              {tool.enabled && (
                <div className={cn(
                  'px-4 py-2 rounded-full text-xs font-medium',
                  tool.id === 'linkedin-profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-primary-100 text-primary-700'
                )}>
                  Available
                </div>
              )}

              {!tool.enabled && (
                <div className="px-4 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SEOToolsGrid;



