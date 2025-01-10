import React, { createContext, useState, useContext } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useAppContext } from "../Context";
import {
  AppState,
  Event,
  DragDropContextType,
  DraggedEvent,
} from "../types/types";
import { filterEventsByDate, getCalendarDays } from "../utils/helperFunctions";

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

import Cell from "./newCell";
dayjs.extend(isSameOrBefore);

const Calendar: React.FC = () => {
  const { state, setState, eventsManager } = useAppContext();
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };
  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<DraggedEvent | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Add a small delay to differentiate between clicks and drags
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const draggedEvent = state.events.find(
      (e: any) => e.id === event.active.id
    );
    if (draggedEvent) {
      setActiveEvent({
        id: draggedEvent.id,
        title: draggedEvent.title,
        count: draggedEvent.count,
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveEvent(null);

    if (!over?.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle cell-to-cell drag
    if (activeData.type === "event" && overData.type === "cell") {
      const activeEvent = state.events.find((e) => e.id === active.id);
      const targetCellId = over.id as string;
      const dateMatch = targetCellId.match(/cell-(\d{4}-\d{2}-\d{2})/);

      if (activeEvent && dateMatch) {
        const newDate = dateMatch[1];
        const newEvents = state.events.map((e) =>
          e.id === activeEvent.id ? { ...e, date: newDate } : e
        );

        eventsManager.setNewEvents(newEvents);
        setState((prev) => ({
          ...prev,
          events: newEvents,
        }));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {" "}
      <CalendarHeader>
        {" "}
        <button onClick={handlePrevMonth}>Previous</button>{" "}
        <h2>{currentDate.format("MMMM YYYY")}</h2>{" "}
        <button onClick={handleNextMonth}>Next</button>{" "}
      </CalendarHeader>{" "}
      <CalendarContainer>
        {" "}
        {daysOfWeek.map((day) => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}{" "}
        {calendarDays.map((date) => (
          <div key={date.toISOString()}>
            {" "}
            <Cell
              isCurrentMonth={date.month() === currentMonth}
              date={date}
            />{" "}
          </div>
        ))}{" "}
      </CalendarContainer>{" "}
      <DragOverlay>
        {activeEvent && <DraggingEventOverlay activeEvent={activeEvent} />}
      </DragOverlay>
    </DndContext>
  );
};

export default Calendar;

const DraggingEventOverlay: React.FC<{
  activeEvent: DraggedEvent | null;
}> = ({ activeEvent }) => {
  if (!activeEvent) return null;

  return (
    <div className="dragging-event-overlay">
      <Wrapper>
        <div>{activeEvent.count}</div>
        <div>{activeEvent.title}</div>
      </Wrapper>
    </div>
  );
};
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

const CalendarContainer = styled.div`
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
