import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds, offset = '-30% 0px -60% 0px') {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    
    if (sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: offset,
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.getAttribute('id'));
        }
      });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));

    return () => {
      sections.forEach(sec => observer.unobserve(sec));
      observer.disconnect();
    };
  }, [sectionIds, offset]);

  return activeId;
}
