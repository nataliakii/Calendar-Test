import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Event } from "../types/types";
import { useAppContext } from "../Context";
import dayjs from "dayjs";

const SortableItem: React.FC<{
  event: Event;
  editingId: string | null;
  newTitle: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleDoubleClick: (id: string, currentTitle: string) => void;
  isEditing: boolean;
  date: dayjs.Dayjs;
}> = ({
  event,
  editingId,
  newTitle,
  handleChange,
  handleBlur,
  handleKeyDown,
  handleDoubleClick,
  isEditing,
}) => {
  const { state, eventsManager } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    console.log("Delete button clicked");
    setIsDeleting(true); // Temporarily disable sorting
    eventsManager.delete(event.id);
    setIsDeleting(false); // Re-enable sorting
  };

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: event.id,
      disabled: isEditing,
      data: {
        type: "event",
        event,
        Date,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition: transition || undefined,
  };

  return (
    <EventItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="event-count">{event.count}</div>
      {isEditing ? (
        <input
          type="text"
          value={newTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div
          className="event-title"
          onDoubleClick={() => handleDoubleClick(event.id, event.title)}
        >
          {event.title}
        </div>
      )}
    </EventItem>
  );
};

export default SortableItem;
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const TitleContainer = styled.span`
  flex-grow: 1;
  margin-left: 8px;
  text-align: left;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 14px;
  z-index: 111;
  &:hover {
    color: darkred;
  }
`;

const EventItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: grab;

  &:hover {
    background: #f7fafc;
  }

  .event-count {
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
    border-radius: 12px;
    font-size: 0.875rem;
  }

  .event-title {
    flex: 1;
  }

  input {
    flex: 1;
    padding: 0.25rem;
    border: 1px solid #cbd5e0;
    border-radius: 2px;
    font-size: 0.875rem;
  }
`;
