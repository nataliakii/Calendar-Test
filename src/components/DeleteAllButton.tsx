import * as React from "react";
import styled from "styled-components";

import { useAppContext } from "../Context";

const DeleteAllButton: React.FC = () => {
  const { deleteAll } = useAppContext(); // delete all events from state and localstorage

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all events?")) {
      deleteAll();
    }
  };

  return <Button onClick={handleDeleteAll}>Delete All</Button>;
};
export default DeleteAllButton;

const Button = styled.button`
  right: 2rem;
  background-color: #ff5555;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff3333;
  }

  @media (max-width: 468px) {
    display: none;
  }
`;
