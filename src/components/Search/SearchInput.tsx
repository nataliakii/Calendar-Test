import React, { useState, ChangeEvent } from "react";
import styled from "styled-components";

import { useAppContext } from "../../Context";
import { Event } from "../../types/types";
import EventsModal from "./EventsModal";

const SearchInput: React.FC = () => {
  //set state for searching term from input
  const [searchTerm, setSearchTerm] = useState<string>("");
  //state for filtered events that have search term in their title
  const [filteredEvents, setFilteredEvents] = useState<Event[] | undefined>();
  // get state with current events from context
  const { state } = useAppContext();
  // state for modal opening/closing with result - filtered events
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // handle search
  const onSearch = () => {
    if (searchTerm.trim() === "") return;
    // find those events that have a term
    const filteredEvents = state.events.filter(
      (event: Event) =>
        event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //set result to state
    setFilteredEvents(filteredEvents);
    //open modal
    setIsModalOpen(true);
  };
  // set new title to state to make update therefore
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  // on clicking button enter start searching
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  };

  const handleSearchButtonClick = () => {
    onSearch();
  };

  return (
    <>
      <SearchWrapper>
        {/* <SearchIconWrapper>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-search"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.742a6.5 6.5 0 1 0-1.414 1.415 5.5 5.5 0 1 1-1.415-1.415 6.5 6.5 0 0 0 1.415-1.415z" />
          </svg>
        </SearchIconWrapper> */}
        <RowWrapper>
          <StyledInput
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <SearchButton onClick={handleSearchButtonClick}>Search</SearchButton>
        </RowWrapper>
      </SearchWrapper>
      <EventsModal
        events={filteredEvents}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default SearchInput;

// Styled Components
const SearchWrapper = styled.div`
  position: relative;
  width: 270px;
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
`;

const RowWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 8px 8px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  transition: border-color 0.2s;

  &:focus {
    border-color: #1c6697;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  background-color: #1c6697;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #134566;
  }

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;
