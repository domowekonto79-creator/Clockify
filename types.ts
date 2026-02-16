
export interface ClockifyUser {
  id: string;
  name: string;
  activeWorkspace: string;
}

export interface ClockifyWorkspace {
  id: string;
  name: string;
}

export interface ClockifyTimeEntry {
  id: string;
  description: string;
  timeInterval: {
    start: string;
    end: string;
    duration: string;
  };
  projectName?: string;
}

export interface ProcessedEntry {
  date: string;
  description: string;
  durationHours: number;
  project: string;
}
