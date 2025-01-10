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
  id: string; // A unique identifier (ISO date string).
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

export function filterEventsByDate<T extends boolean>(
  date: dayjs.Dayjs,
  state: AppState,
  isEvent: T = true as T
): T extends true ? Event[] : Holiday[] {
  // Format the given date as 'YYYY-MM-DD'
  const isoDate = date.format("YYYY-MM-DD");

  const eventType: Holiday[] | Event[] = isEvent
    ? state.events
    : state.holidays;

  // Filter events where the date matches the formatted input date
  const events = eventType.filter((e) => e.date === isoDate);

  return events as T extends true ? Event[] : Holiday[];
}

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
