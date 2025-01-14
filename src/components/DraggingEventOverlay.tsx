import React from "react";

import styled from "styled-components";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

import { Event } from "../types/types";

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
      <div>{activeEvent.count}</div>
      <div>{activeEvent.title}</div>
    </Wrapper>
  );
};

export default DraggingEventOverlay;

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
