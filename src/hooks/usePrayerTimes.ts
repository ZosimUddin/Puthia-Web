import { useState, useEffect } from 'react';

export function usePrayerTimes() {
  const [currentPrayer, setCurrentPrayer] = useState<string>("লোড হচ্ছে...");

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Puthia&country=Bangladesh&method=1');
        const data = await res.json();
        if (data && data.data && data.data.timings) {
          const timings = data.data.timings;
          
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();

          const prayers = [
            { name: 'ফজর', timeStr: timings.Fajr },
            { name: 'যোহর', timeStr: timings.Dhuhr },
            { name: 'আসর', timeStr: timings.Asr },
            { name: 'মাগরিব', timeStr: timings.Maghrib },
            { name: 'এশা', timeStr: timings.Isha }
          ];

          let nextPrayer = prayers[0];
          for (let prayer of prayers) {
            const [hours, minutes] = prayer.timeStr.split(':').map(Number);
            const prayerTime = hours * 60 + minutes;
            if (prayerTime > currentTime) {
              nextPrayer = prayer;
              break;
            }
          }

          // Format 24h to 12h bn
          const [h, m] = nextPrayer.timeStr.split(':').map(Number);
          const ampm = h >= 12 ? 'পিএম' : 'এএম';
          const h12 = h % 12 || 12;
          
          // Bengali numbers
          const bnNumbers = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
          const convertToBn = (str: string | number) => String(str).split('').map(c => bnNumbers[Number(c)] || c).join('');

          const formattedTime = `${convertToBn(h12)}:${convertToBn(m.toString().padStart(2, '0'))}`;
          
          setCurrentPrayer(`${nextPrayer.name}: ${formattedTime}`);
        }
      } catch (err) {
        console.error(err);
        setCurrentPrayer("পাওয়া যায়নি");
      }
    };
    fetchPrayerTimes();
  }, []);

  return currentPrayer;
}
