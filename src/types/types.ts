export interface Event {
  id: string;
  title: string;
  date: string;
  description?: string;
  count: number;
}

export interface Holiday {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export interface AppState {
  holidays: Holiday[];
  events: Event[];
}

export interface EventsManager {
  get: () => Event[];
  add: (newEvent: Event) => Event[];
  update: (id: string, updatedTitle: string) => Event[];
  delete: (id: string) => Event[];
  setNewEvents: (newEvents: Event[]) => Event[];
}

export interface ActiveDragState {
  type: "internal" | "cross-cell" | null;
  sourceDate: string | null;
  targetDate: string | null;
}

export interface DragDropContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export interface DraggedEvent {
  id: string;
  title: string;
  count: number;
}
