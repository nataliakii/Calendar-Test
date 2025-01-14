import * as React from "react";
import styled from "styled-components";

import { AppProvider } from "./Context";
import Calendar from "./components/Calendar";
import SearchInput from "./components/Search/SearchInput";
import DeleteAllButton from "./components/DeleteAllButton";

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContainer>
        <Header>
          <CenteredContainer>
            <SearchInput />
          </CenteredContainer>
          <DeleteAllButton />
        </Header>
        <Calendar />
      </AppContainer>
    </AppProvider>
  );
};

export default App;

// Styled Components
const Header = styled.header`
  background-color: #282c34;
  min-height: 7vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const AppContainer = styled.div`
  text-align: center;
  a {
    color: #61dafb;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
