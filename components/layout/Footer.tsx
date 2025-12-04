'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
} from 'react-icons/fa';
import { loadConfig } from '@/lib/config';
import type { SiteConfig } from '@/types';

const socialMediaIcons = {
  youtube: FaYoutube,
  facebook: FaFacebook,
  instagram: FaInstagram,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
};

export default function Footer() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  const socialMedia = config?.socialMedia || {};

  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-10 md:py-12" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col items-center space-y-5 sm:space-y-6">
          {/* Social Media Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6"
            role="navigation"
            aria-label="Social media links"
          >
            {Object.entries(socialMedia).map(([platform, url], index) => {
              if (!url) return null;
              const Icon =
                socialMediaIcons[platform as keyof typeof socialMediaIcons];
              if (!Icon) return null;

              return (
                <motion.a
                  key={platform}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white active:text-gray-300 transition-colors duration-200 touch-manipulation p-2"
                  aria-label={`Visit our ${platform.charAt(0).toUpperCase() + platform.slice(1)} page (opens in new tab)`}
                >
                  <Icon size={24} className="sm:w-7 sm:h-7" />
                </motion.a>
              );
            })}
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center text-gray-400 text-xs sm:text-sm px-4"
          >
            <p>
              &copy; {new Date().getFullYear()}{' '}
              {config?.artist.name || 'Aishwarya Manikarnike'}. All rights
              reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
