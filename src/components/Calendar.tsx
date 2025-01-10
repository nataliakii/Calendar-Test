import React, { createContext, useState, useMemo } from "react";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useAppContext } from "../Context";
import {
  AppState,
  Event,
  DragDropContextType,
  DraggedEvent,
} from "../types/types";
import { filterEventsByDate, getCalendarDays } from "../utils/helperFunctions";
import Cell from "./Cell";

// library imports
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import styled from "styled-components";
import dayjs from "dayjs";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
dayjs.extend(isSameOrBefore);

const DraggingEventOverlay: React.FC<{
  id: string; // ID of the event being dragged
  events: Event[]; // List of all events
  isDraggingBetweenCells: boolean; // Whether the event is being dragged between calendar cells
}> = ({ id, events, isDraggingBetweenCells }) => {
  // Find the active event based on the ID passed to the component
  const activeEvent = events.find((event) => event.id === id);

  // If no active event is found, return null to render nothing
  if (!activeEvent) return null;

  return (
    <Wrapper
      style={{
        // Scale the overlay to indicate the event is being dragged between cells
        transform: isDraggingBetweenCells ? "scale(1.05)" : "scale(1)",
      }}
    >
      {/* Display the count (e.g., the order number or sequence of the event) */}
      <div>{activeEvent.count}</div>
      {/* Display the title of the event being dragged */}
      <div>{activeEvent.title}</div>
    </Wrapper>
  );
};

const Calendar: React.FC = () => {
  // Accessing global state and updater function from the context
  const { state, setState } = useAppContext();

  // Getting the current date using dayjs
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today); // State for the current selected date
  const currentYear = currentDate.year(); // Extracting the year from the current date
  const currentMonth = currentDate.month(); // Extracting the month from the current date

  // Array representing the days of the week for the calendar header
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Memoizing the function to get calendar days for the current year and month
  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth), // Function to get the days of the month
    [currentYear, currentMonth] // Dependency array ensures it recalculates when year or month changes
  );

  // Handler to move to the previous month
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  // Handler to move to the next month
  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  // State to track the currently active event (for drag-and-drop)
  const [activeId, setActiveId] = useState<string | null>(null);

  // State to track whether an event is being dragged between cells
  const [isDraggingBetweenCells, setIsDraggingBetweenCells] = useState(false);

  // Sensors for detecting drag and drop events (pointer and keyboard sensors)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100, // Delay to differentiate between click and drag
        tolerance: 5, // Tolerance for drag movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates, // Keyboard sensor configuration
    })
  );

  // Handler for when the drag starts
  const handleDragStart = (event) => {
    const { active } = event;
    console.log("Drag started:", active.id);
    setActiveId(active.id); // Store the ID of the dragged event
  };

  // Handler for when the drag is over a potential drop target
  const handleDragOver = (event) => {
    const { over } = event;
    setIsDraggingBetweenCells(over?.data.current?.type === "cell"); // Check if over a calendar cell
  };

  // Handler for when the drag ends (drop event)
  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null); // Reset the active ID after drag ends
    setIsDraggingBetweenCells(false); // Reset the dragging state

    if (!over) return; // If no drop target, do nothing

    const activeEvent = state.events.find((e) => e.id === active.id);
    if (!activeEvent) return;

    // Handle cross-cell drops (moving event to a new date)
    if (over.data.current?.type === "cell") {
      const newDate = over.data.current.date.format("YYYY-MM-DD");

      // Update the global state to move the event to the new date
      setState((prev) => ({
        ...prev,
        events: prev.events.map(
          (e) => (e.id === active.id ? { ...e, date: newDate } : e) // Update the event date
        ),
      }));
      return;
    }

    // Handle reordering events within the same cell
    if (over.data.current?.type === "event") {
      const overEvent = state.events.find((e) => e.id === over.id);
      if (!overEvent || activeEvent.date !== overEvent.date) return;

      const dateEvents = state.events.filter(
        (e) => e.date === activeEvent.date
      );
      const oldIndex = dateEvents.findIndex((e) => e.id === active.id);
      const newIndex = dateEvents.findIndex((e) => e.id === over.id);

      // Reorder events based on drag-and-drop
      const reorderedEvents = arrayMove(dateEvents, oldIndex, newIndex);
      const updatedEvents = reorderedEvents.map((event, index) => ({
        ...event,
        count: index + 1, // Update event counts for reorder
      }));

      // Update the global state with the reordered events
      setState((prev) => ({
        ...prev,
        events: [
          ...prev.events.filter((e) => e.date !== activeEvent.date),
          ...updatedEvents,
        ],
      }));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Detects the closest drop target
      onDragStart={handleDragStart} // Triggered when drag starts
      onDragOver={handleDragOver} // Triggered while dragging over a target
      onDragEnd={handleDragEnd} // Triggered when drag ends
    >
      {/* Calendar Header with buttons for navigating between months */}
      <CalendarHeader>
        <button onClick={handlePrevMonth}>
          <FaArrowLeft /> {/* Icon for previous month */}
        </button>
        <h2>{currentDate.format("MMMM YYYY")}</h2>
        <button onClick={handleNextMonth}>
          <FaArrowRight /> {/* Icon for next month */}
        </button>
      </CalendarHeader>

      {/* Calendar body, displaying the days of the week and each calendar day */}
      <CalendarContainer>
        {daysOfWeek.map((day) => (
          <DayHeader key={day}>{day}</DayHeader> // Display day names (Sun, Mon, etc.)
        ))}

        {calendarDays.map((date) => (
          <div key={date.toISOString()}>
            <Cell isCurrentMonth={date.month() === currentMonth} date={date} />
            {/* Render each calendar cell, passing whether it's the current month */}
          </div>
        ))}
      </CalendarContainer>

      {/* Dragging overlay to show the event being dragged */}
      <DragOverlay>
        {activeId ? (
          <DraggingEventOverlay
            id={activeId} // ID of the event being dragged
            events={state.events} // List of all events
            isDraggingBetweenCells={isDraggingBetweenCells} // Whether dragging between cells
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Calendar;

// Styled Components
const CalendarContainer = styled.div`
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 10% repeat (6, 1fr);
  gap: 5px;
  max-width: 100%;
  height: 100minv;
  margin: 0 auto;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const CalendarHeader = styled.div`
  grid-column: span 7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

const DayHeader = styled.div`
  text-align: center;
  font-weight: bold;
  line-height: 3;
`;

const Wrapper = styled.div`
  display: flex;
  transform: scale(1.05);
  transition: transform 0.2s ease;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: grabbing;
`;
