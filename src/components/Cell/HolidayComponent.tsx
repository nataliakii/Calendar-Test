import { ReactElement } from "react";
import styled from "styled-components";

import { Holiday } from "../../types/types";

interface SliderProps {
  holidays: Holiday[];
}

const HolidayComponent: React.FC<SliderProps> = ({
  holidays,
}): ReactElement | null => {
  if (!holidays || holidays.length === 0) return null;
  return (
    <div>
      {holidays?.map((e) => (
        <div key={e.id}>{e.title}</div>
      ))}
    </div>
  );
};

export default HolidayComponent;
