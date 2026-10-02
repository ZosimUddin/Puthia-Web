import { useState, useEffect } from 'react';

export const useRecentlyViewed = (itemId: string, itemType: string, itemData: any) => {
  useEffect(() => {
    if (!itemId) return;
    const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const newHistory = [
      { itemId, itemType, itemData, timestamp: Date.now() },
      ...history.filter((h: any) => h.itemId !== itemId)
    ].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(newHistory));
  }, [itemId, itemType, itemData]);
};

export const getRecentlyViewed = () => {
  return JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
};
