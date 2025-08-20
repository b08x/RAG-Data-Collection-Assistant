
export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum FileStatus {
    Summarizing = 'Summarizing',
    Complete = 'Complete',
    Error = 'Error',
}

export interface Annotation {
    id: string;
    text: string;
}

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    content: ArrayBuffer;
    summary: string;
    status: FileStatus;
    annotations: Annotation[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  details: string[];
  status: TaskStatus;
  files: UploadedFile[];
  fileConfig?: {
    accept: string;
    maxFiles: number;
    folder: string;
  };
}

export interface Phase {
  title?: string;
  subtitle: string;
  tasks: Task[];
}
