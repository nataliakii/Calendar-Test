import React, { ReactElement } from "react";
import styled from "styled-components";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import dayjs from "dayjs";

import { Event } from "../../types/types";

interface SortableItemProps {
  event: Event;
  newTitle: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleDoubleClick: (id: string, currentTitle: string) => void;
  isEditing: boolean;
  date: dayjs.Dayjs;
  dragType: "internal" | "external" | null;
}

const SortableItem: React.FC<SortableItemProps> = ({
  event,
  newTitle,
  handleChange,
  handleBlur,
  handleKeyDown,
  handleDoubleClick,
  isEditing,
  dragType,
}): ReactElement => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: event.id,
      disabled: isEditing || dragType === "external",
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
      <EventCount>{event.count}</EventCount>
      {isEditing ? (
        <Input
          type="text"
          value={newTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <Title onDoubleClick={() => handleDoubleClick(event.id, event.title)}>
          {event.title}
        </Title>
      )}
    </EventItem>
  );
};

export default SortableItem;

// Styled Components
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

  input {
    flex: 1;
    padding: 0.25rem;
    border: 1px solid #cbd5e0;
    border-radius: 2px;
    font-size: 0.875rem;
  }
`;

const Title = styled.div`
  flex: 1;
`;

const EventCount = styled.div`
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 12px;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
`;
