import { useState, useEffect, useCallback } from 'react';

export const useAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Clear announcement after a short delay
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 1000);
  }, []);

  const announceLoading = useCallback((resource) => {
    announce(`Loading ${resource}...`);
  }, [announce]);

  const announceLoaded = useCallback((resource, count) => {
    if (count) {
      announce(`Loaded ${count} ${resource}`);
    } else {
      announce(`${resource} loaded`);
    }
  }, [announce]);

  const announceError = useCallback((error) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  return {
    prefersReducedMotion,
    announcements,
    announce,
    announceLoading,
    announceLoaded,
    announceError
  };
};

export const useKeyboardNavigation = (onEnter, onEscape, onArrowUp, onArrowDown) => {
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onEnter) onEnter(event);
        break;
      case 'Escape':
        if (onEscape) onEscape(event);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (onArrowUp) onArrowUp(event);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (onArrowDown) onArrowDown(event);
        break;
      default:
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown]);

  return handleKeyDown;
};

export const useFocusManagement = () => {
  const trapFocus = useCallback((containerRef) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback((elementRef) => {
    return () => {
      elementRef.current?.focus();
    };
  }, []);

  return { trapFocus, restoreFocus };
};

export default useAccessibility;
