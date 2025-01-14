import React, { createContext, useContext, useState, useEffect } from "react";
import { transformHolidaysData } from "./utils/helperFunctions";
import { Event, Holiday, AppState } from "./types/types";
import stateManager from "./data/data";

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  addEvent: (newEvent: Event) => void;
  updateEvent: (id: string, updatedTitle: string) => void;
  deleteEvent: (id: string) => void;
  setNewEvents: (newEvents: Event[]) => void;
  deleteAll: () => void;
}
// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const eventsManager = stateManager();
  const [state, setState] = useState<AppState>({
    holidays: [],
    events: eventsManager.get(),
  });

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          "https://date.nager.at/api/v3/NextPublicHolidays/UA"
        );
        const rawData = await response.json();
        const data: Holiday[] = transformHolidaysData(rawData);
        setState((prevState) => ({
          events: eventsManager.get(),
          holidays: data,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    // const fetchEvents = () => {
    //   setNewEvents(eventsManager.get());
    // };

    fetchHolidays();
    // fetchEvents();
  }, []);

  const addEvent = (newEvent: Event) => {
    const updatedEvents = eventsManager.add(newEvent);
    setState((prev) => ({ ...prev, events: updatedEvents }));
  };

  const updateEvent = (id: string, updatedTitle: string) => {
    const updatedEvents = eventsManager.update(id, updatedTitle);
    setState((prev) => ({ ...prev, events: updatedEvents }));
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = eventsManager.delete(id);
    setState((prev) => ({ ...prev, events: updatedEvents }));
  };

  const setNewEvents = (newEvents: Event[]) => {
    const updatedEvents = eventsManager.setNewEvents(newEvents);
    setState((prev) => ({ ...prev, events: updatedEvents }));
  };

  const deleteAll = () => {
    eventsManager.deleteAll();
    setState((prev) => ({ ...prev, events: [] }));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        addEvent,
        deleteEvent,
        setNewEvents,
        updateEvent,
        deleteAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for accessing the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
