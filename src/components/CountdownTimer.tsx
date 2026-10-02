import React, { useState, useEffect } from 'react';

const toBengaliNumber = (num: number | string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(d => bengaliDigits[parseInt(d)] || d).join('');
};

const themeStyles = {
  red: { text: "text-[#d63031]", bg: "bg-[#ffeaea]" },
  teal: { text: "text-teal-700", bg: "bg-teal-100" },
  orange: { text: "text-orange-700", bg: "bg-orange-100" },
  blue: { text: "text-blue-700", bg: "bg-blue-100" },
};

export const CountdownTimer = ({ targetDate, theme = 'red', onExpire }: { targetDate: Date, theme?: 'red' | 'teal' | 'orange' | 'blue', onExpire?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
         setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
         });
      } else if (!expired) {
         setExpired(true);
         if (onExpire) onExpire();
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, expired, onExpire]);

  const currentTheme = themeStyles[theme];

  return (
    <div className="flex items-center gap-1 text-[11px] font-bold">
       <span className={`${currentTheme.bg} border ${currentTheme.bg.replace('bg-', 'border-').replace('100', '200')} ${currentTheme.text} px-1.5 py-0.5 rounded`}>
         {toBengaliNumber(timeLeft.days.toString().padStart(2, '0'))} দিন
       </span>
       <span className={`${currentTheme.bg} border ${currentTheme.bg.replace('bg-', 'border-').replace('100', '200')} ${currentTheme.text} px-1.5 py-0.5 rounded`}>
         {toBengaliNumber(timeLeft.hours.toString().padStart(2, '0'))} ঘণ্টা
       </span>
       <span className={`${currentTheme.bg} border ${currentTheme.bg.replace('bg-', 'border-').replace('100', '200')} ${currentTheme.text} px-1.5 py-0.5 rounded`}>
         {toBengaliNumber(timeLeft.minutes.toString().padStart(2, '0'))} মি:
       </span>
       <span className={`${currentTheme.bg} border ${currentTheme.bg.replace('bg-', 'border-').replace('100', '200')} ${currentTheme.text} px-1.5 py-0.5 rounded`}>
         {toBengaliNumber(timeLeft.seconds.toString().padStart(2, '0'))} সে:
       </span>
    </div>
  );
};
