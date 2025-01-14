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
