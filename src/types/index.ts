import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'pelamar_kerja' | 'pencari_kandidat';
      company?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'pelamar_kerja' | 'pencari_kandidat';
    company?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'pelamar_kerja' | 'pencari_kandidat';
    company?: string;
  }
}

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

export interface Application {
  _id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  answers: {
    questionId: string;
    question: string;
    answer: string | string[];
  }[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  notes?: string;
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
  };
  createdAt: string;
  updatedAt: string;
}

