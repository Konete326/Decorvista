import { useEffect, useRef } from 'react';

const useKeyboardNavigation = (items, onSelect, isOpen = true) => {
  const activeIndexRef = useRef(-1);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      activeIndexRef.current = -1;
      return;
    }

    const handleKeyDown = (event) => {
      if (!items || items.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          activeIndexRef.current = Math.min(activeIndexRef.current + 1, items.length - 1);
          focusItem(activeIndexRef.current);
          break;
        
        case 'ArrowUp':
          event.preventDefault();
          activeIndexRef.current = Math.max(activeIndexRef.current - 1, 0);
          focusItem(activeIndexRef.current);
          break;
        
        case 'Home':
          event.preventDefault();
          activeIndexRef.current = 0;
          focusItem(0);
          break;
        
        case 'End':
          event.preventDefault();
          activeIndexRef.current = items.length - 1;
          focusItem(items.length - 1);
          break;
        
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeIndexRef.current >= 0 && onSelect) {
            onSelect(items[activeIndexRef.current], activeIndexRef.current);
          }
          break;
        
        case 'Escape':
          activeIndexRef.current = -1;
          break;
      }
    };

    const focusItem = (index) => {
      const item = itemsRef.current[index];
      if (item) {
        item.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, onSelect, isOpen]);

  const registerItem = (index) => (element) => {
    if (element) {
      itemsRef.current[index] = element;
    }
  };

  const getItemProps = (index) => ({
    ref: registerItem(index),
    tabIndex: activeIndexRef.current === index ? 0 : -1,
    'aria-selected': activeIndexRef.current === index,
    role: 'option',
  });

  return {
    activeIndex: activeIndexRef.current,
    getItemProps,
  };
};

export default useKeyboardNavigation;
