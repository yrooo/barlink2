// Core types for the job platform

export interface CustomQuestion {
  _id?: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  salary?: string;
  employerId: string;
  customQuestions: CustomQuestion[];
  status: 'active' | 'inactive' | 'closed';
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  location: string;
  salaryRange: string;
  company: string;
  datePosted: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface Interview {
  _id?: string;
  applicationId: string;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  type: 'online' | 'offline';
  location?: string;
  meetingLink?: string;
  notes?: string;
  googleCalendarEventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewFormData {
  candidateName: string;
  position: string;
  date: string;
  time: string;
  type: 'online' | 'offline';
  location: string;
  notes: string;
}

export interface Application {
  _id: string;
  jobId: string;
  applicantId: string | User;
  employerId: string;
  answers: {
    questionId: string;
    question: string;
    answer: string | string[];
  }[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  notes?: string;
  interviewScheduled?: boolean;
  createdAt: string;
  updatedAt: string;
}

// For the job seeker's dashboard, where job details are populated
export interface ApplicationWithJobDetails extends Omit<Application, 'jobId'> {
  jobId: Job; // Overwrite jobId to be the populated Job object
}


export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'pelamar_kerja' | 'pencari_kandidat';
  company?: string;
  profile?: {
    bio?: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    location?: string;
    image?: string;
    cvUrl?: string;
    cvPath?: string;
    cvFileName?: string;
    cvUploadedAt?: Date;
  };
  createdAt: string;
  updatedAt: string;
}

