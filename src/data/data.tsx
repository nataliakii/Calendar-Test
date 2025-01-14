import { Event } from "../types/types";

import dayjs from "dayjs";

const stateManager = () => {
  // Key used to save and load events state in localStorage
  const LOCAL_STORAGE_KEY = "eventsState";

  // Function to load events from localStorage
  const loadFromLocalStorage = (): Event[] => {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedEvents ? JSON.parse(storedEvents) : [];
  };

  // Function to save events to localStorage
  const saveToLocalStorage = (events: Event[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  };
  // Initialize the events state with data loaded from localStorage
  let eventsState: Event[] = loadFromLocalStorage();

  const recalculateCountsForDate = (events: Event[], date: string) => {
    // Get all events for the specific date
    const dateEvents = events.filter((event) =>
      dayjs(event.date).isSame(dayjs(date), "day")
    );

    // Sort them by count to maintain order
    const sortedDateEvents = dateEvents.sort((a, b) => a.count - b.count);

    // Recalculate counts
    return sortedDateEvents.map((event, index) => ({
      ...event,
      count: index + 1,
    }));
  };

  return {
    // Get all events from the current state
    get: (): Event[] => {
      return [...eventsState];
    },
    // Add a new event to the state
    add: (newEvent: Event): Event[] => {
      const eventDate = dayjs(newEvent.date);

      // Get all events for the same date
      const sameDataEvents = eventsState.filter((event) =>
        eventDate.isSame(dayjs(event.date), "day")
      );

      // Get all other events
      const otherDatesEvents = eventsState.filter(
        (event) => !eventDate.isSame(dayjs(event.date), "day")
      );

      // Add new event and recalculate counts for the specific date
      const updatedDateEvents = recalculateCountsForDate(
        [newEvent, ...sameDataEvents],
        newEvent.date
      );

      // Combine all events
      eventsState = [...otherDatesEvents, ...updatedDateEvents];

      saveToLocalStorage(eventsState);
      return [...eventsState];
    },

    update: (id: string, updatedTitle: string): Event[] => {
      // Reload the complete state before any operation
      eventsState = loadFromLocalStorage();

      const eventToUpdate = eventsState.find((event) => event.id === id);
      if (!eventToUpdate) return [...eventsState];

      // Create a new array with the updated title
      const updatedEvents = eventsState.map((event) =>
        event.id === id ? { ...event, title: updatedTitle } : event
      );

      // Get events for the same date as the updated event
      const sameDataEvents = recalculateCountsForDate(
        updatedEvents.filter((event) =>
          dayjs(event.date).isSame(dayjs(eventToUpdate.date), "day")
        ),
        eventToUpdate.date
      );

      // Get all other events
      const otherDatesEvents = updatedEvents.filter(
        (event) => !dayjs(event.date).isSame(dayjs(eventToUpdate.date), "day")
      );

      // Update the complete state
      eventsState = [...otherDatesEvents, ...sameDataEvents];

      saveToLocalStorage(eventsState);
      return [...eventsState];
    },

    delete: (id: string): Event[] => {
      const eventToDelete = eventsState.find((event) => event.id === id);

      if (!eventToDelete) return [...eventsState];

      // Remove the event
      const filteredEvents = eventsState.filter((event) => event.id !== id);

      // Recalculate counts for the date of the deleted event
      const sameDataEvents = recalculateCountsForDate(
        filteredEvents.filter((event) =>
          dayjs(event.date).isSame(dayjs(eventToDelete.date), "day")
        ),
        eventToDelete.date
      );

      // Get all other events
      const otherDatesEvents = filteredEvents.filter(
        (event) => !dayjs(event.date).isSame(dayjs(eventToDelete.date), "day")
      );

      // Combine all events
      eventsState = [...otherDatesEvents, ...sameDataEvents];

      saveToLocalStorage(eventsState);
      return [...eventsState];
    },

    setNewEvents: (newEvents: Event[]): Event[] => {
      // Group events by date
      const eventsByDate = newEvents.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(event);
        return acc;
        // utility type used to construct an object type with keys of type K and values of type T
      }, {} as Record<string, Event[]>);

      // Recalculate counts for each date
      const updEvents = Object.entries(eventsByDate).flatMap(([date, events]) =>
        recalculateCountsForDate(events, date)
      );
      // Update the state with the processed events
      eventsState = updEvents;
      saveToLocalStorage(eventsState);
      return [...eventsState];
    },

    // Delete all events from the state and localStorage
    deleteAll: (): Event[] => {
      eventsState = [];
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    },
  };
};

export default stateManager;
