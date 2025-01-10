import { Event } from "../types/types";

const stateManager = () => {
  const LOCAL_STORAGE_KEY = "eventsState";

  // Helper to load events from localStorage
  const loadFromLocalStorage = (): Event[] => {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedEvents ? JSON.parse(storedEvents) : [];
  };

  // Helper to save events to localStorage
  const saveToLocalStorage = (events: Event[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  };

  // Initialize eventsState from localStorage
  let eventsState: Event[] = loadFromLocalStorage();

  const recalculateCounts = (events: Event[]) =>
    events.map((event, index) => ({
      ...event,
      count: index + 1,
    }));

  return {
    get: (): Event[] => {
      return [...eventsState];
    },
    add: (newEvent: Event): Event[] => {
      eventsState = recalculateCounts([newEvent, ...eventsState]);
      saveToLocalStorage(eventsState);
      return eventsState; // Return updated state
    },
    update: (id: string, updatedTitle: string): Event[] => {
      eventsState = eventsState.map((event) =>
        event.id === id ? { ...event, title: updatedTitle } : event
      );
      saveToLocalStorage(eventsState);
      return eventsState; // Return updated state
    },
    delete: (id: string): Event[] => {
      eventsState = recalculateCounts(
        eventsState.filter((event) => event.id !== id)
      );
      saveToLocalStorage(eventsState);
      return eventsState; // Return updated state
    },
    setNewEvents: (newEvents: Event[]): Event[] => {
      eventsState = recalculateCounts(newEvents);
      saveToLocalStorage(eventsState);
      return eventsState; // Return updated state
    },
  };
};

export default stateManager;
