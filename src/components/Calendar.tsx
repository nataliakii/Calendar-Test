import React, { createContext, useState, useMemo } from "react";

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
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import styled from "styled-components";
import dayjs from "dayjs";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

//imports from project
import { useAppContext } from "../Context";
import { getCalendarDays } from "../utils/helperFunctions";
import Cell from "./Cell/Cell";
import DraggingEventOverlay from "./DraggingEventOverlay";

const Calendar: React.FC = () => {
  // Accessing global state and updater function from the context
  const { state, setState, setNewEvents, deleteAll } = useAppContext();

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
  const [dragType, setDragType] = useState<"internal" | "external" | null>(
    null
  );
  // State to track whether an event is being dragged between cells
  const [isDraggingBetweenCells, setIsDraggingBetweenCells] = useState(false);

  // Sensors for detecting drag and drop events (pointer and keyboard sensors)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Determine if this is an internal cell drag or external calendar drag
    const draggedEvent = state.events.find((e) => e.id === active.id);
    const isDraggingFromCell = active.data.current?.type === "event";

    setDragType(isDraggingFromCell ? "internal" : "external");
    console.log("Drag started:", {
      id: active.id,
      type: isDraggingFromCell ? "internal" : "external",
    });
  };

  const handleDragOver = (event) => {
    const { over } = event;
    setIsDraggingBetweenCells(over?.data.current?.type === "cell");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);
    setIsDraggingBetweenCells(false);
    setDragType(null);

    if (!over) return;

    const activeEvent = state.events.find((e) => e.id === active.id);
    if (!activeEvent) return;

    // Handle dropping onto a new cell
    if (over.data.current?.type === "cell") {
      // deleteAll();
      console.log(" ended and dragging is between cells");
      const newDate = over.data.current.date.format("YYYY-MM-DD");
      const oldDate = activeEvent.date;

      // Get all events from the old date and new date
      const oldDateEvents = state.events.filter((e) => e.date === oldDate);
      const newDateEvents = state.events.filter((e) => e.date === newDate);

      // Remove the active event from old date events
      const remainingOldDateEvents = oldDateEvents
        .filter((e) => e.id !== active.id)
        .map((e, index) => ({ ...e, count: index + 1 }));

      // Add the active event to new date events
      const updatedNewDateEvents = [
        { ...activeEvent, date: newDate, count: 1 },
        ...newDateEvents.map((e) => ({ ...e, count: e.count + 1 })),
      ];

      // Update global state
      setState((prev) => {
        const newState = {
          ...prev,
          events: [
            ...prev.events.filter(
              (e) => e.date !== oldDate && e.date !== newDate
            ),
            ...remainingOldDateEvents,
            ...updatedNewDateEvents,
          ],
        };
        setNewEvents(newState.events);
        return newState;
      });
      return;
    }

    // Handle reordering within the same cell
    if (over.data.current?.type === "event") {
      const overEvent = state.events.find((e) => e.id === over.id);
      if (!overEvent || activeEvent.date !== overEvent.date) return;

      const dateEvents = state.events.filter(
        (e) => e.date === activeEvent.date
      );
      const oldIndex = dateEvents.findIndex((e) => e.id === active.id);
      const newIndex = dateEvents.findIndex((e) => e.id === over.id);

      const reorderedEvents = arrayMove(dateEvents, oldIndex, newIndex).map(
        (event, index) => ({
          ...event,
          count: index + 1,
        })
      );

      setState((prev) => {
        const newEvents = {
          ...prev,
          events: [
            ...prev.events.filter((e) => e.date !== activeEvent.date),
            ...reorderedEvents,
          ],
        };
        setNewEvents(newEvents.events);
        return newEvents;
      });
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
            <Cell
              isCurrentMonth={date.month() === currentMonth}
              date={date}
              dragType={dragType}
            />
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
