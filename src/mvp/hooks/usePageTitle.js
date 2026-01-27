import { useEffect } from 'react';

/**
 * Sets the document title for a page
 * @param {string} title - Page-specific title (will be appended with " | GameTeam")
 */
export function usePageTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | GameTeam` : 'GameTeam';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
