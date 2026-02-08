
import type { ReactNode } from 'react';

// SEO Fields
export interface SEOFields {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  slug: string;
}

// College Sub-types
export interface FeeStructureItem {
  course: string;
  yearlyFee: number;
  totalFee: number;
}

export interface PlacementInfo {
  averagePackage: string;
  highestPackage: string;
  topRecruiters: string[]; // URLs to logos
}

// Main Data Models
export interface College {
  id: string;
  name: string;
  location?: string;

  shortName: string;
  logo: string; // URL or base64
  coverImage: string; // URL or base64
  establishedYear: number;
  type: 'Government' | 'Private' | 'Autonomous' | 'Deemed';
  universityAffiliation: string;
  accreditation: string[]; // e.g., ['NAAC', 'AICTE']
  city: string;
  state: string;
  country: string;
  campusArea: string; // e.g., "50 Acres"
  website: string;
  contactEmail: string;
  contactPhone: string;
  overview: string; // Rich text
  highlights: string[]; // List of strings
  rankings: string[]; // List of strings
  feeStructure: FeeStructureItem[];
  placements: PlacementInfo;
  facilities: string[]; // e.g., ['Hostel', 'Library']
  photoGallery: string[]; // Array of image URLs
  videoGallery: string[]; // Array of YouTube URLs
  seo: SEOFields;
  isPublished: boolean;
}

export interface Course {
  id: string;
  collegeId: string; // Link to College
  name: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'PhD';
  duration: string; // e.g., "4 years"
  eligibility: string;
  fees: number; // Total fees
  examsAccepted: string[];
  description: string;
  specializations: string[];
  seatsAvailable: number;
  status: 'Active' | 'Inactive';
  isPublished: boolean;
}

export interface Exam {
  id:string;
  name: string;
  examType: 'National' | 'State' | 'University' | 'College-level';
  conductingBody: string;
  date: string; // YYY-MM
  examMode: 'Online' | 'Offline' | 'Hybrid';
  examFee: number;
  eligibilityCriteria: string;
  examPattern: string; // Rich text
  syllabus: string; // URL to PDF or text
  officialWebsite: string;
  importantDates: { event: string; date: string }[];
  description: string; // Rich text
}

export interface Blog {
  id: string;
  title: string;
  featuredImage: string; // URL
  author: string;
  publishedDate: string; // YYYY-MM-DD
  category: 'News' | 'Exam Tips' | 'College Reviews' | 'Admission Updates';
  tags: string[];
  content: string; // Rich text / HTML
  seo: SEOFields;
  isPublished: boolean;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  interestedIn: string;
  date: string;
  type: "contact" | "registration";
  status: "Resolved" | "Not Resolved";
}


export interface Event {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  description: string; // Rich text
  registrationLink: string;
  image: string; // URL
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  isPublished: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Super Admin' | 'Editor' | 'Viewer';
}

export type DataItem = College | Course | Exam | Blog | Enquiry | User | Event;

export type Page = 'dashboard' | 'colleges' | 'courses' | 'exams' | 'blogs' | 'enquiries' | 'events' | 'settings' |"editCollege" | "editExam" | "addBlog" | "editBlog"  ; 

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

export interface FormField {
    name: string;
    label: string;

    // ADD NESTED TYPES HERE
    type:
      | 'text'
      | 'number'
      | 'date'
      | 'select'
      | 'textarea'
      | 'image'
      | 'file'
      | 'checkbox'
      | 'multiselect'
      | 'richtext'
      | 'email'
      | 'nestedArray'       // NEW
      | 'nestedObject';     // NEW
    
    multiple?: boolean;
    options?: { value: string; label: string }[];
    required?: boolean;
    placeholder?: string;
    isArray?: boolean;

    // ADD FIELDS FOR NESTED STRUCTURE
    fields?: FormField[];    // SUPPORTS nested UI like courses, steps, structure
}


export interface ApiService<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  add: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  getCounts?: () => Promise<any>; 
  addFormData?: (data: FormData) => Promise<void>;
  updateFormData?: (id: string, data: FormData) => Promise<void>;
  bulkUpload?: (file: File) => Promise<{ success: boolean; message: string }>;
  importFromUrl?: (url: string) => Promise<{ success: boolean; message: string }>;
}
