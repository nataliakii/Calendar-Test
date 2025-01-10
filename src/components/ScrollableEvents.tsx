import React, { ReactElement, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import dayjs, { Dayjs } from "dayjs";
import { useAppContext } from "../Context";
import { filterEventsByDate } from "../utils/helperFunctions";
import { AppState, Event, Holiday, ActiveDragState } from "../types/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SortableItem from "./SortableItem";

interface CellProps {
  events: Event[];
  date: dayjs.Dayjs;
  isOver: boolean;
}

const ScrollableEvents: React.FC<CellProps> = ({
  events: initialEvents,
  date,
  isOver,
}): ReactElement => {
  const { state, eventsManager } = useAppContext();
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleDoubleClick = (id: string, currentTitle: string) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleBlur = () => {
    if (editingId) {
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents.map((event) =>
          event.id === editingId ? { ...event, title: newTitle } : event
        );
        eventsManager.setNewEvents(updatedEvents);
        return updatedEvents;
      });
    }
    setEditingId(null);
    setNewTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const handleAddEvent = () => {
    const newEvent = {
      id: `event-${Date.now()}`,
      title: "New Event",
      count: 1,
      date: date.format("YYYY-MM-DD"),
    };

    setEvents((prevEvents) => {
      // Increment the count of each existing event
      const updatedEvents = prevEvents.map((event) => ({
        ...event,
        count: event.count + 1, // Increment the count
      }));

      eventsManager.setNewEvents(updatedEvents);

      return [newEvent, ...updatedEvents]; // New event at the top of the list
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInternalDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log("activeData", activeData);
    console.log("overData", overData);

    if (overData.type == activeData.type) {
      setEvents((prevItems) => {
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);

        const newArray = arrayMove(prevItems, oldIndex, newIndex);
        // save new order of items resetting count property
        newArray.forEach((item, index) => {
          item.count = index + 1;
        });
        eventsManager.setNewEvents(newArray);
        return newArray;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleInternalDragEnd}
    >
      <StyledButton onClick={handleAddEvent}>Add Event</StyledButton>

      <SortableContext
        items={events.map((event) => event.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollableContainer isOver={isOver}>
          <StyledList>
            {events
              .sort((a, b) => a.count - b.count)
              .map((event) => (
                <SortableItem
                  key={event.id}
                  event={event}
                  date={date}
                  isEditing={editingId === event.id}
                  editingId={editingId}
                  newTitle={newTitle}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  handleKeyDown={handleKeyDown}
                  handleDoubleClick={handleDoubleClick}
                />
              ))}
          </StyledList>
        </ScrollableContainer>
      </SortableContext>
    </DndContext>
  );
};

export default ScrollableEvents;

// Update your styled components for visual feedback
const ScrollableContainer = styled.div<{
  isOver?: boolean;
  isDraggingBetweenCells?: boolean;
}>`
  min-height: 120px;
  overflow-y: auto;
  transition: all 0.2s ease;

  ${(props) =>
    props.isOver &&
    props.isDraggingBetweenCells &&
    `
    background-color: rgba(0, 120, 255, 0.05);
    border-radius: 4px;
  `}
  scrollbar-width: thin;
  scrollbar-color: #888 #ddd;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #ddd;
  }
`;

const StyledList = styled.ol`
  margin: 0;
  padding: 0;
  list-style-position: inside;
  text-align: left;
  font-size: 14px;
  color: #333;
  line-height: 1.2;
  li {
    padding: 5px 10px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    justify-content: space-between;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background-color: #f1f1f1;
      cursor: pointer;
    }
  }
`;

const StyledButton = styled.button`
  background-color: #007bff;
  margin-top: 2px;
  margin-bottom: 5px;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  &:active {
    background-color: #003d80;
    transform: scale(0.95);
  }

  &:disabled {
    background-color: #cfcfcf;
    color: #6c757d;
    cursor: not-allowed;
  }
`;
