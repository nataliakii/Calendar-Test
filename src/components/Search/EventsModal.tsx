import React, { useState } from "react";
import styled from "styled-components";
import { useAppContext } from "../../Context";
import dayjs from "dayjs";
import { Event } from "../../types/types";

interface EventsModalProps {
  events: Event[] | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const EventsModal: React.FC<EventsModalProps> = ({
  events,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { updateEvent } = useAppContext();
  const [cellEvents, setEvents] = useState(events);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleDoubleClick = (id: string, currentTitle: string) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleBlur = () => {
    if (editingId) {
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents?.map((event) =>
          event.id === editingId ? { ...event, title: newTitle } : event
        );
        return updatedEvents;
      });
      updateEvent(editingId, newTitle);
    }

    setEditingId(null);
    setNewTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Events Found</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <EventsList>
          {cellEvents && cellEvents.length > 0 ? (
            cellEvents.map((event) => (
              <EventCard key={event.id}>
                <EventHeader>
                  {editingId === event.id ? (
                    <EventTitleInput
                      value={newTitle}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <EventTitle
                      onDoubleClick={() =>
                        handleDoubleClick(event.id, event.title)
                      }
                    >
                      {event.title}
                    </EventTitle>
                  )}
                  <EventDate>
                    {dayjs(event.date).format(" DD MMMM YY")}
                  </EventDate>
                </EventHeader>
                {event.description && (
                  <EventDescription>{event.description}</EventDescription>
                )}
              </EventCard>
            ))
          ) : (
            <NoEvents>No events found</NoEvents>
          )}
        </EventsList>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EventsModal;

// Styled Components for Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #020000;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const EventsList = styled.div`
  overflow-y: auto;
  max-height: calc(80vh - 100px);
`;

const EventCard = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #c20e0e;
`;

const EventTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #c20e0e;
  font-weight: 500;
`;

const EventDate = styled.span`
  color: #666;
  font-size: 0.875rem;
`;

const EventDescription = styled.p`
  margin: 10px 0 0;
  color: #c20e0e;
  font-size: 0.875rem;
`;

const NoEvents = styled.p`
  text-align: center;
  color: #666;
  padding: 20px;
`;

const EventTitleInput = styled.input`
  font-size: 1rem;
  font-weight: bold;
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  padding: 4px;
`;
