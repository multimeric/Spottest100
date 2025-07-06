import { useState, useEffect } from 'react';

export const useScrollToBottom = (threshold: number = 100): boolean => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const checkIsAtBottom = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      const isBottom = windowHeight + scrollTop >= documentHeight - threshold;
      setIsAtBottom(isBottom);
    };

    // Check on scroll
    window.addEventListener('scroll', checkIsAtBottom);
    
    // Check when DOM changes (content added/removed)
    const resizeObserver = new ResizeObserver(checkIsAtBottom);
    resizeObserver.observe(document.body);
    
    checkIsAtBottom(); // Check initial state

    return () => {
      window.removeEventListener('scroll', checkIsAtBottom);
      resizeObserver.disconnect();
    };
  }, [threshold]);

  return isAtBottom;
};
