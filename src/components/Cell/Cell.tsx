import React, { ReactElement } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import { useDroppable } from "@dnd-kit/core";

import Holiday from "./HolidayComponent";
import { useAppContext } from "../../Context";
import { filterHolidaysByDate } from "../../utils/helperFunctions";
import ScrollableEvents from "./ScrollableEvents";

interface CellProps {
  isCurrentMonth: boolean;
  date: dayjs.Dayjs;
  dragType: "internal" | "external" | null;
}

const Cell: React.FC<CellProps> = ({
  isCurrentMonth,
  date,
  dragType,
}): ReactElement => {
  const { state } = useAppContext();

  const holidays = filterHolidaysByDate(date, state);

  // Setup droppable area for the cell
  const { setNodeRef } = useDroppable({
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
    >
      <TopWrapper hasHolidays={holidays.length > 0}>
        <DateWrapper>{date.date()}</DateWrapper>
        <HolidayWrapper>
          <Holiday holidays={holidays} />
        </HolidayWrapper>
      </TopWrapper>
      <ScrollableEvents date={date} dragType={dragType} />
    </CalendarCell>
  );
};

export default Cell;

// Styled Components
const DateWrapper = styled.div`
  padding: 5px;
`;

const CalendarCell = styled.div<{
  isCurrentMonth: boolean;
}>`
  background-color: ${(props) => (props.isCurrentMonth ? "white" : "#f5f5f5")}
  flex-grow: 1;
  min-width: 145px;
  overflow-y: auto;
  min-height: 120px; 
  max-height: 180px; 
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
