import React, { ReactElement, useState, useContext } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { AppState, Event, ActiveDragState } from "../types/types";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import Holiday from "./HolidayComponent";
import { useAppContext } from "../Context";
import { filterEventsByDate } from "../utils/helperFunctions";
import ScrollableEvents from "./ScrollableEvents";

interface CellProps {
  isCurrentMonth: boolean;
  date: dayjs.Dayjs;
}

const Cell: React.FC<CellProps> = ({ isCurrentMonth, date }) => {
  const { state } = useAppContext();
  const cellId = `cell-${date.format("YYYY-MM-DD")}`;

  // Use droppable hook from dnd-kit
  const { setNodeRef, isOver } = useDroppable({
    id: cellId,
    data: {
      date: date,
      isCurrentMonth: isCurrentMonth,
      type: "cell",
    },
  });

  const holidays = filterEventsByDate(date, state, false);
  // Get events for this cell's date
  const cellEvents = state.events.filter(
    (event) => event.date === date.format("YYYY-MM-DD")
  );

  return (
    <CellWrapper
      ref={setNodeRef}
      isCurrentMonth={isCurrentMonth}
      className="cell"
    >
      <div className="date-number">{date.format("D")}</div>
      <div className="events-container">
        <Holiday holidays={holidays} />
        {cellEvents.map((event) => (
          <Draggable
            key={event.id}
            id={event.id}
            data={{
              type: "event",
              event: event,
            }}
          >
            <EventWrapper>
              <ScrollableEvents
                events={cellEvents}
                date={date}
                isOver={isOver}
              />
            </EventWrapper>
          </Draggable>
        ))}
      </div>
    </CellWrapper>
  );
};

// Draggable component with data
interface DraggableProps {
  id: string;
  children: React.ReactNode;
  data: any;
}

const Draggable: React.FC<DraggableProps> = ({ id, children, data }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: data,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default Cell;

// Styled components
const CellWrapper = styled.div<{ isCurrentMonth: boolean }>`
  background: ${(props) => (props.isCurrentMonth ? "#fff" : "#f5f5f5")};
  min-height: 100px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;

  .date-number {
    font-size: 0.875rem;
    color: #666;
  }

  .events-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
`;

const EventWrapper = styled.div`
  background: #e3f2fd;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: grab;
  user-select: none;

  &:hover {
    background: #bbdefb;
  }

  .event-count {
    font-weight: bold;
  }

  .event-title {
    font-size: 0.875rem;
  }
`;
