'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setDisplayChildren(children);
  }, [children, pathname]);

  const variants = {
    hidden: { 
      opacity: 0,
      y: 10
    },
    enter: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.33, 1, 0.68, 1] // easeOutCubic
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: { 
        duration: 0.3, 
        ease: [0.33, 1, 0.68, 1] // easeOutCubic
      }
    }
  };

  return (
    <div className="page-transition-container min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={variants}
          className="min-h-screen w-full"
        >
          {displayChildren}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransition; 