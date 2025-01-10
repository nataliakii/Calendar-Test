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

const Cell: React.FC<CellProps> = ({ isCurrentMonth, date }): ReactElement => {
  const { state, setState, eventsManager } = useAppContext();

  const holidays = filterEventsByDate(date, state, false);
  const cellEvents = filterEventsByDate(date, state, true);

  // Setup droppable area for the cell
  const { setNodeRef, isOver, active } = useDroppable({
    id: `cell-${date.format("YYYY-MM-DD")}`,
    data: {
      date,
      type: "cell",
    },
  });

  return (
    <CalendarCell
      data-cell-date={date.format("YYYY-MM-DD")}
      ref={setNodeRef}
      isCurrentMonth={isCurrentMonth}
      isOver={isOver}
    >
      <TopWrapper hasHolidays={holidays.length > 0}>
        <DateWrapper>{date.date()}</DateWrapper>
        <HolidayWrapper>
          <Holiday holidays={holidays} />
        </HolidayWrapper>
      </TopWrapper>
      <ScrollableEvents events={cellEvents} date={date} isOver={isOver} />
    </CalendarCell>
  );
};

export default Cell;

const DateWrapper = styled.div`
  padding: 5px;
`;

const CalendarCell = styled.div<{
  isCurrentMonth: boolean;
  isOver?: boolean;
}>`
  background-color: ${(props) =>
    props.isOver
      ? "rgba(0, 0, 0, 0.05)"
      : props.isCurrentMonth
      ? "white"
      : "#f5f5f5"}
  flex-grow: 1;
  overflow-y: auto;
  max-height: 150px; 
  padding: 5px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;

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

const HolidayWrapper = styled.div`
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`;

const TopWrapper = styled.div<{ hasHolidays: boolean }>`
  display: flex;
  justify-content: space-evenly;
  background-color: ${({ hasHolidays }) => (hasHolidays ? "yellow" : "white")};
  padding: ${({ hasHolidays }) => (hasHolidays ? " 8px" : "0")};
  border-radius: ${({ hasHolidays }) => (hasHolidays ? " 4px" : "0")};
  font-weight: bold;
`;
