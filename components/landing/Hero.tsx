import React from 'react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@/components/animate-ui/components/avatar-group';

const AVATARS = [
  {
    src: 'https://wallpapersok.com/images/high/loneliness-of-an-anime-character-in-black-and-white-vt6c4kh64hx2pear.jpg',
    fallback: 'KR',
    tooltip: 'Karan',
  },
  {
    src: 'https://cdn.hero.page/pfp/2becd299-7348-4819-9e82-d2fba4505e65-monochrome-anime-boy-close-up-eminent-black-and-white-anime-boy-pfp-3.png',
    fallback: 'FZ',
    tooltip: 'Faiz',
  },
  {
    src: 'https://cdn.hero.page/pfp/4e124d56-42c5-41b7-a1fc-aed304055b1f-retro-styled-anime-girl-in-monochrome-classic-black-and-white-anime-girl-pfp-2.png',
    fallback: 'SH',
    tooltip: 'Shrey',
  },
  {
    src: 'https://i.pinimg.com/1200x/7a/15/82/7a15827615db1289ffe2c896732d891f.jpg',
    fallback: 'KA',
    tooltip: 'Kaustubh',
  },
  {
    src: 'https://i.pinimg.com/736x/19/43/ae/1943ae205055bd0a5d73fec344e35b6b.jpg',
    fallback: 'AD',
    tooltip: 'Aditya',
  },
];

const Hero = () => {
  return (
    <section className="bg-white-50 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Slogan */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Learn Smart.{' '}
          <span className="">Learn Fast.</span>{' '}
          <span className="">Learn Everything.</span>
        </h1>
        
        {/* Subheading */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Access all the study materials with just one signup.
        </p>
        
        {/* CTA Button */}
        <Link href="/subjects">
          <button className="inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-5 text-lg sm:text-xl font-semibold text-white bg-black rounded-full hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl mb-8">
            Start with your journey
            <svg 
              className="ml-3 w-5 h-5 sm:w-6 sm:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </Link>
        
        {/* Avatar Group */}
        <div className="flex justify-center">
          <AvatarGroup className="h-32 -space-x-3">
            {AVATARS.map((avatar, index) => (
              <Avatar key={index} className="size-12 border-3 border-background">
                <AvatarImage src={avatar.src} />
                <AvatarFallback>{avatar.fallback}</AvatarFallback>
                <AvatarGroupTooltip>
                  <p>{avatar.tooltip}</p>
                </AvatarGroupTooltip>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </div>
    </section>
  );
};

export default Hero;
