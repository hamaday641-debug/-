import { CITIES, CityOption } from '../components/PrayerTimesQibla';
import { adhanScheduler } from './adhanScheduler';
import { PrayerTimes, TodayPrayerTimes } from '../types';

export type { TodayPrayerTimes };

export class PrayerTimesService {
  public getTodayPrayerTimes(date: Date = new Date()): PrayerTimes {
    const selectedCity = adhanScheduler.getSelectedCity();
    const schedule = adhanScheduler.calculatePrayerTimes(
      selectedCity.lat,
      selectedCity.lng,
      date,
      selectedCity.timezone
    );

    // Calculate tomorrow's schedule for seamless Fajr transition after Isha
    const tomorrowDate = new Date(date);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowSchedule = adhanScheduler.calculatePrayerTimes(
      selectedCity.lat,
      selectedCity.lng,
      tomorrowDate,
      selectedCity.timezone
    );

    // Calculate Next Prayer and Time Left with Second-Level Accuracy
    const now = date;
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    const parseToSeconds = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 3600 + m * 60;
    };

    const prayerList = [
      { name: 'الفجر', key: 'fajr', seconds: parseToSeconds(schedule.fajr), time: schedule.fajr, isObligatory: true },
      { name: 'الشروق', key: 'sunrise', seconds: parseToSeconds(schedule.sunrise), time: schedule.sunrise, isObligatory: false },
      { name: 'الظهر', key: 'dhuhr', seconds: parseToSeconds(schedule.dhuhr), time: schedule.dhuhr, isObligatory: true },
      { name: 'العصر', key: 'asr', seconds: parseToSeconds(schedule.asr), time: schedule.asr, isObligatory: true },
      { name: 'المغرب', key: 'maghrib', seconds: parseToSeconds(schedule.maghrib), time: schedule.maghrib, isObligatory: true },
      { name: 'العشاء', key: 'isha', seconds: parseToSeconds(schedule.isha), time: schedule.isha, isObligatory: true }
    ];

    // Determine current prayer and next prayer
    // Only obligatory prayers are considered for next prayer countdown unless user is before sunrise
    let next = prayerList.find(p => p.seconds > currentSeconds);
    let currentPrayerName = 'العشاء';
    let isPrayerTimeNow = false;

    // Check which prayer window we are currently inside
    for (let i = prayerList.length - 1; i >= 0; i--) {
      if (currentSeconds >= prayerList[i].seconds) {
        currentPrayerName = prayerList[i].name;
        // If within 20 minutes of prayer start, flag as currently prayer time
        const elapsedSincePrayer = currentSeconds - prayerList[i].seconds;
        if (elapsedSincePrayer >= 0 && elapsedSincePrayer <= 20 * 60) {
          isPrayerTimeNow = true;
        }
        break;
      }
    }

    let timeToNextFormatted = '';
    let secondsToNext = 0;

    if (next) {
      secondsToNext = next.seconds - currentSeconds;
      const hours = Math.floor(secondsToNext / 3600);
      const mins = Math.floor((secondsToNext % 3600) / 60);
      const secs = secondsToNext % 60;

      if (hours > 0) {
        timeToNextFormatted = `${hours} س و ${mins} د`;
      } else if (mins > 0) {
        timeToNextFormatted = `${mins} د و ${secs} ث`;
      } else {
        timeToNextFormatted = `${secs} ثانية`;
      }
    } else {
      // Past Isha -> Next is tomorrow's Fajr
      const tomorrowFajrSeconds = parseToSeconds(tomorrowSchedule.fajr) + 24 * 3600;
      secondsToNext = tomorrowFajrSeconds - currentSeconds;
      const hours = Math.floor(secondsToNext / 3600);
      const mins = Math.floor((secondsToNext % 3600) / 60);
      next = {
        name: 'الفجر',
        key: 'fajr',
        seconds: tomorrowFajrSeconds,
        time: tomorrowSchedule.fajr,
        isObligatory: true
      };
      timeToNextFormatted = `${hours} س و ${mins} د`;
    }

    // Hijri date string approximation / formatting
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let hijriFormatted = '';
    try {
      hijriFormatted = hijriFormatter.format(date);
    } catch {
      hijriFormatted = '١٤٤٧ هـ';
    }

    return {
      fajr: schedule.fajr,
      sunrise: schedule.sunrise,
      dhuhr: schedule.dhuhr,
      asr: schedule.asr,
      maghrib: schedule.maghrib,
      isha: schedule.isha,
      nextPrayerName: next ? next.name : 'الفجر',
      nextPrayerTime: next ? next.time : schedule.fajr,
      timeToNext: timeToNextFormatted,
      secondsToNext,
      currentPrayerName,
      isPrayerTimeNow,
      hijriFormatted,
      city: selectedCity.name
    };
  }
}

export const prayerTimesService = new PrayerTimesService();
