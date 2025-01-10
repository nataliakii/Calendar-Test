import React, { createContext, useContext, useState, useEffect } from "react";
import { transformHolidaysData } from "./utils/helperFunctions";
import { Event, Holiday, AppState, EventsManager } from "./types/types";
import stateManager from "./data/data";

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  eventsManager: EventsManager;
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
        console.log(data);
        setState((prevState) => ({
          events: eventsManager.get(),
          holidays: data,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchHolidays();
  }, []);

  return (
    <AppContext.Provider value={{ state, setState, eventsManager }}>
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
