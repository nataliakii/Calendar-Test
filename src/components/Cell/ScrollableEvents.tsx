import React, { ReactElement, useState, useEffect } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { generateUniqueId } from "../../utils/helperFunctions";
import { useAppContext } from "../../Context";
import { Event } from "../../types/types";
import SortableItem from "./SortableItem";

interface ScrollableEventsProps {
  date: dayjs.Dayjs;
  dragType: "internal" | "external" | null;
}

const ScrollableEvents: React.FC<ScrollableEventsProps> = ({
  date,
  dragType,
}): ReactElement => {
  const { state, addEvent, updateEvent } = useAppContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filteredEvents = state.events.filter((event) =>
      dayjs(event.date).isSame(dayjs(date), "day")
    );
    setEvents(filteredEvents);
  }, [date, state.events]);

  // enable input field for changing title by double clicking on it
  const handleDoubleClick = (id: string, currentTitle: string) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  // on clicking outside of input area
  const handleBlur = () => {
    if (editingId) {
      if (newTitle.trim() === "") {
        // set error to state and display message
        setError("Title cannot be empty");
        return;
      }
      // update event in context
      updateEvent(editingId, newTitle);
    }
    //delete editing id from state
    setEditingId(null);
    // reset newTitle state
    setNewTitle("");
    // set error to null
    setError(null);
  };

  // on clicking button
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  // add new event using global context
  const handleAddEvent = () => {
    //generate new event object as a default
    const newEvent = {
      id: generateUniqueId(),
      title: "New Event",
      count: 1,
      date: date.format("YYYY-MM-DD"),
    };
    // add event globally in context
    addEvent(newEvent);
  };

  return (
    <>
      <StyledButton onClick={handleAddEvent}>Add Event</StyledButton>
      {error && <ErrorMessage>{error}</ErrorMessage>}{" "}
      {/* Display error message */}
      <ScrollableContainer>
        <StyledList>
          {events
            .sort((a, b) => a.count - b.count)
            .map((event) => (
              <SortableItem
                key={event.id}
                event={event}
                date={date}
                isEditing={editingId === event.id}
                newTitle={newTitle}
                handleChange={handleChange}
                handleBlur={handleBlur}
                handleKeyDown={handleKeyDown}
                handleDoubleClick={handleDoubleClick}
                dragType={dragType}
              />
            ))}
        </StyledList>
      </ScrollableContainer>
    </>
  );
};

export default ScrollableEvents;

// Styled Components
const ScrollableContainer = styled.div<{
  isDraggingBetweenCells?: boolean;
}>`
  min-height: 120px;
  overflow-y: auto;
  transition: all 0.2s ease;

  ${(props) =>
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
  background-color: #1c6697;
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
    background-color: #134566;
    transform: scale(1.05);
  }

  &:active {
    background-color: #134566;
    transform: scale(0.95);
  }

  &:disabled {
    background-color: #cfcfcf;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 0.9em;
  margin-top: 0.5em;
`;
