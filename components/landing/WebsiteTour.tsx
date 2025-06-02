import React from 'react';
import HeroVideoDialog from '@/components/magicui/hero-video-dialog';

const WebsiteTour = () => {
    return (
         <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Website Tour
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover how Ziora transforms your learning experience.
          </p>
          <HeroVideoDialog 
            videoSrc="/pokemon.mp4" 
            thumbnailSrc="/pic.png"
            className="max-w-2xl mx-auto"
          />
        </div>
    )
}

export default WebsiteTour;