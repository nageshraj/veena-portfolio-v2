'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { loadConfig } from '@/lib/config';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { SiteConfig } from '@/types';

export default function About() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    loadConfig()
      .then(setConfig)
      .catch((err) => {
        console.error('Failed to load config:', err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <section id="about" className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">Error loading configuration: {error}</p>
        </div>
      </section>
    );
  }

  if (!config) {
    return (
      <section id="about" className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-gray-600">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white" aria-label="About">
      <div id="about-section" className="max-w-5xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-3 md:mb-4 px-4">
            About {config.artist.name.split(' ')[0]}
          </h2>
          <div className="w-24 sm:w-28 h-1 bg-gradient-gold mx-auto rounded-full"></div>
        </motion.div>

        {/* Biography Subsections */}
        <div className="space-y-8 sm:space-y-10 md:space-y-12 px-2">
          {config.artist.fullBio.map((paragraph, index) => (
            <BiographySubsection
              key={index}
              content={paragraph}
              index={index}
            />
          ))}
        </div>

        {/* Additional subsection for musical journey */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 sm:mt-12 md:mt-16 p-6 sm:p-7 md:p-8 bg-white rounded-lg shadow-premium-lg border border-premium"
          role="complementary"
          aria-label="Musical excellence highlights"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-semibold text-navy-900 mb-4 sm:mb-5 md:mb-6">
            Musical Excellence
          </h3>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
            With a deep commitment to preserving the rich heritage of Carnatic music while
            embracing innovation, {config.artist.name.split(' ')[0]} continues to inspire
            audiences around the world. Her performances are a testament to years of rigorous
            training, artistic sensitivity, and an unwavering dedication to her craft.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Subsection component with intersection observer
interface BiographySubsectionProps {
  content: string;
  index: number;
}

const BiographySubsection = ({ content, index }: BiographySubsectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref, { threshold: 0.2 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.7,
        delay: index * 0.15, // Staggered animation
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for elegance
      }}
      className="subsection"
    >
      <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed font-light">
        {content}
      </p>
    </motion.div>
  );
};
