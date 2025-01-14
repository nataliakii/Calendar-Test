import dayjs from "dayjs";
import { AppState, Event, Holiday } from "../types/types";

interface RawHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

interface TransformedHoliday {
  id: string;
  title: string;
  date: string;
  description: string;
}

export function transformHolidaysData(
  rawData: RawHoliday[]
): TransformedHoliday[] {
  return rawData.map((el) => {
    return {
      id: dayjs(el.date).toISOString().slice(0, 13),
      title: el.name,
      date: el.date,
      description: `${el?.types.join(",")} holiday`,
    };
  });
}

export function filterHolidaysByDate<T>(
  date: dayjs.Dayjs,
  state: AppState
): Holiday[] {
  // Format the given date as 'YYYY-MM-DD'
  const isoDate = date.format("YYYY-MM-DD");

  // Filter events where the date matches the formatted input date
  const holidays = state.holidays.filter((e) => e.date === isoDate);

  return holidays;
}

// creates calendar days for the current page including days from prev month and next month is they are within the current weeks
export const getCalendarDays = (year: number, month: number): dayjs.Dayjs[] => {
  const startOfCurrentMonth = dayjs(new Date(year, month)).startOf("month");
  const endOfCurrentMonth = startOfCurrentMonth.endOf("month");
  //days from prev months that are in the same week with the start of current month
  const startOfPrevMonth = startOfCurrentMonth.startOf("week");
  //days from next months that are in the same week with the end of current month
  const endOfNextMonth = endOfCurrentMonth.endOf("week");
  // Create a list of all days from the start of the previous month to the end of the next month
  const days: dayjs.Dayjs[] = [];
  let currentDay = startOfPrevMonth;
  while (currentDay.isSameOrBefore(endOfNextMonth, "day")) {
    days.push(currentDay);
    currentDay = currentDay.add(1, "day");
  }
  return days;
};

export const generateUniqueId = (): string => {
  const randomString = Math.random().toString(36).substring(2, 10); // Generate a random string
  return `${randomString}`;
};
