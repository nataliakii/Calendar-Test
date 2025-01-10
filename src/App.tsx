import * as React from "react";
import "./App.css";
import styled from "styled-components";
import { AppProvider } from "./Context";
import Calendar from "./components/Calendar";
// import Calendar from "./components/newCalendar";

const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="App">
        <Header>Header</Header>
        <Calendar />
      </div>
    </AppProvider>
  );
};

export default App;

// Styled Components
const Header = styled.header`
  background-color: #282c34;
  min-height: 7vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  font-size: calc(10px + 2vmin);
  color: white;
  text-transform: uppercase;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    min-height: 10vh;
    font-size: calc(8px + 1.5vmin);
  }
`;
