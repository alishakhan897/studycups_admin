
import React from 'react';
import type { Page, Column, FormField, College, Course, Exam, Blog, Enquiry, User, Event } from './types';
import { LayoutDashboard, Building, BookOpen, PenSquare, FileText, MessageSquare, Settings, Calendar } from 'lucide-react';

export const NAV_LINKS: { page: Page; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'colleges', label: 'Colleges', icon: Building },
  { page: 'courses', label: 'Courses', icon: BookOpen },
  { page: 'exams', label: 'Exams', icon: PenSquare },
  { page: 'blogs', label: 'Blogs', icon: FileText },
  { page: 'enquiries', label: 'Enquiries', icon: MessageSquare },
  { page: 'events', label: 'Events', icon: Calendar },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export const collegeColumns: Column<College>[] = [
  { 
    header: 'Name',
    accessor: 'name',
    className: 'font-semibold'
  },

  {
    header: 'City',
    accessor: (item) => (item.location || '').split(',')[0] || ''
  },

  {
    header: 'State',
    accessor: (item) => (item.location || '').split(',')[1] || ''
  },

  {
    header: 'Status',
    accessor: () => 'Draft'
  }
];


export const courseColumns: Column<Course>[] = [
  { header: "Name", accessor: "name", className: "font-semibold" },

  { header: "Level", accessor: "level" },

  {
    header: "Colleges Offering",
    accessor: (item: any) => item.totalColleges || 0
  },

  {
    header: "Stream",
    accessor: (item: any) => item.stream || "N/A"
  },
];


export const examColumns: Column<Exam>[] = [
  { header: 'Name', accessor: 'name', className: 'font-semibold' },
  { header: 'Date', accessor: 'date' },
  { header: 'Type', accessor: 'examType' },
];

export const blogColumns: Column<Blog>[] = [
  { header: 'Title', accessor: 'title', className: 'font-semibold' },
  { header: 'Author', accessor: 'author' },
  { header: 'Category', accessor: 'category' },
  { header: 'Status', accessor: (item) => item.isPublished ? 'Published' : 'Draft' },
];

export const enquiryColumns: Column<Enquiry>[] = [
  {
    header: "",
    accessor: (item: any) => (
      <input
        type="checkbox"
        checked={item.status === "Resolved"}
        onChange={() => item.toggleResolved(item)}
        className="cursor-pointer"
      />
    )
  },

  { header: "Name", accessor: "name", className: "font-semibold" },

  { header: "Email", accessor: "email" },

  { header: "Interested In", accessor: "interestedIn" },

  { header: "Status", accessor: "status" },

  {
    header: "Type",
    accessor: (item: any) => item.type || "Contact"
  },
];


export const eventColumns = [
  {
    header: "Title",
    accessor: "title",
    className: "font-semibold"
  },
  {
    header: "Category",
    accessor: "category"
  },
  {
    header: "Date",
    accessor: (item) => item.date ? item.date.slice(0, 10) : ""
  },
  {
    header: "Description",
    accessor: "description"
  },
  {
    header: "College ID",
    accessor: (item) => item.collegeId ?? "N/A"
  }
];


export const userColumns: Column<User>[] = [
    { header: 'Name', accessor: 'name', className: 'font-semibold' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
];

// Form Field Definitions
export const collegeFormFields: FormField[] = [
  
  { name: "name", label: "College Name", type: "text", required: true },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "rating", label: "Rating", type: "number" },
  { name: "reviewCount", label: "Review Count", type: "number" },
 // 🔥 MAIN IMAGE (Cover)
{
  name: "image",
  label: "Main Image (Cover)",
  type: "file",
  multiple: false
},

// 🔥 LOGO
{
  name: "logo",
  label: "College Logo",
  type: "file",
  multiple: false
},

// 🔥 PHOTO GALLERY
{
  name: "gallery",
  label: "College Photo Gallery",
  type: "nestedArray",
  fields: [
    {
      name: "image",
      label: "Gallery Image",
      type: "file"
    }
  ]
},


  { name: "established", label: "Established Year", type: "number" },

  {
    name: "type",
    label: "College Type",
    type: "select",
    required: true,
    options: [
      { value: "Private", label: "Private" },
      { value: "Government", label: "Government" }
    ]
  },

  {
    name: "stream",
    label: "Stream",
    type: "select",
    required: true,
    options: [
      { value: "Engineering", label: "Engineering" },
      { value: "Medical", label: "Medical" },
      { value: "Management", label: "Management" },
      { value: "Arts & Science", label: "Arts & Science" },
      { value: "Law", label: "Law" },
      { value: "Design", label: "Design" }
    ]
  },

  { name: "accreditation", label: "Accreditations", type: "text", isArray: true },
  { name: "highlights", label: "Highlights", type: "text", isArray: true },

  { name: "feesRange.min", label: "Minimum Fees", type: "number" },
  { name: "feesRange.max", label: "Maximum Fees", type: "number" },

  { name: "description", label: "Description", type: "textarea" },

  /*
  =====================================================
  COURSES (CourseSchema)
  =====================================================
  */
  {
    name: "courses",
    label: "Courses",
    type: "nestedArray",
    fields: [
    
      { name: "name", label: "Course Name", type: "text", required: true },
      { name: "duration", label: "Duration", type: "text" },
      { name: "level", label: "Level", type: "text" },
      { name: "fees", label: "Fees", type: "number" },
      { name: "eligibility", label: "Eligibility", type: "text" },
      { name: "about", label: "About Course", type: "textarea" },
      { name: "programType", label: "Program Type", type: "text" },
      { name: "intake", label: "Intake", type: "text" },
      { name: "longEligibility", label: "Detailed Eligibility", type: "textarea" },

      {
        name: "admissionProcess",
        label: "Admission Process",
        type: "nestedArray",
        fields: [
          { name: "step", label: "Step No.", type: "number" },
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" }
        ]
      },

      { name: "highlights", label: "Course Highlights", type: "text", isArray: true },
      { name: "skills", label: "Skills", type: "text", isArray: true },

      {
        name: "structure",
        label: "Course Structure",
        type: "nestedArray",
        fields: [
          { name: "year", label: "Year", type: "text" },
          { name: "topics", label: "Topics", type: "text", isArray: true }
        ]
      },

      {
        name: "statistics",
        label: "Statistics",
        type: "nestedObject",
        fields: [
          { name: "studentsEnrolled", label: "Students Enrolled", type: "text" },
          { name: "placementRate", label: "Placement Rate", type: "text" },
          { name: "recruiters", label: "Recruiters", type: "text" },
          { name: "ranking", label: "Ranking", type: "text" }
        ]
      }
    ]
  },

  /*
  =====================================================
  PLACEMENTS (PlacementsSchema)
  =====================================================
  */
  {
    name: "placements",
    label: "Placements",
    type: "nestedObject",
    fields: [
      { name: "highestPackage", label: "Highest Package", type: "text" },
      { name: "averagePackage", label: "Average Package", type: "text" },
      { name: "placementPercentage", label: "Placement Percentage", type: "number" },
      { name: "topRecruiters", label: "Top Recruiters", type: "text", isArray: true }
    ]
  },

  /*
  =====================================================
  REVIEWS (ReviewSchema)
  =====================================================
  */
  {
    name: "reviews",
    label: "Reviews",
    type: "nestedArray",
    fields: [
      { name: "author", label: "Author", type: "text" },
      { name: "rating", label: "Rating", type: "number" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "source", label: "Source", type: "text" }
    ]
  }
];




export const courseFormFields: FormField[] = [
  { name: 'name', label: 'Course Name', type: 'text', required: true },
  { name: 'collegeId', label: 'College ID', type: 'text', required: true },
  { name: 'isPublished', label: 'Status', type: 'select', required: true, options: [
      { value: 'true', label: 'Published' },
      { value: 'false', label: 'Draft' },
  ]},
  { name: 'duration', label: 'Duration (e.g., 4 years)', type: 'text', required: true },
  { name: 'level', label: 'Level', type: 'select', required: true, options: [
    { value: 'Undergraduate', label: 'Undergraduate' },
    { value: 'Postgraduate', label: 'Postgraduate' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'PhD', label: 'PhD' },
  ]},
  { name: 'eligibility', label: 'Eligibility', type: 'text' },
  { name: 'fees', label: 'Total Fees', type: 'number' },
  { name: 'seatsAvailable', label: 'Seats Available', type: 'number' },
  { name: 'examsAccepted', label: 'Exams Accepted (comma-separated)', type: 'text', isArray: true },
  { name: 'specializations', label: 'Specializations (comma-separated)', type: 'text', isArray: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'status', label: 'Internal Status', type: 'select', required: true, options: [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ]},
];

export const examFormFields: FormField[] = [
    { name: 'name', label: 'Exam Name', type: 'text', required: true },
    { name: 'date', label: 'Exam Date (YYYY-MM)', type: 'text', required: true },
    { name: 'examType', label: 'Type', type: 'select', required: true, options: [
        { value: 'National', label: 'National' },
        { value: 'State', label: 'State' },
        { value: 'University', label: 'University' },
        { value: 'College-level', label: 'College-level' },
    ]},
    { name: 'conductingBody', label: 'Conducting Body', type: 'text' },
    { name: 'examMode', label: 'Exam Mode', type: 'select', options: [
        { value: 'Online', label: 'Online' },
        { value: 'Offline', label: 'Offline' },
        { value: 'Hybrid', label: 'Hybrid' },
    ]},
    { name: 'examFee', label: 'Exam Fee', type: 'number' },
    { name: 'officialWebsite', label: 'Official Website', type: 'text', placeholder: 'https://example.com' },
    { name: 'syllabus', label: 'Syllabus URL', type: 'text', placeholder: 'https://example.com/syllabus.pdf' },
    { name: 'eligibilityCriteria', label: 'Eligibility Criteria', type: 'textarea' },
    { name: 'examPattern', label: 'Exam Pattern', type: 'textarea' },
    { name: 'description', label: 'Description', type: 'richtext' },
];

export const blogFormFields: FormField[] = [
    { name: 'title', label: 'Blog Title', type: 'text', required: true },
    { name: 'author', label: 'Author', type: 'text', required: true },
    { name: 'publishedDate', label: 'Published Date', type: 'date', required: true },
    { name: 'featuredImage', label: 'Featured Image URL', type: 'text', placeholder: 'https://example.com/image.jpg' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'News', label: 'News' },
      { value: 'Exam Tips', label: 'Exam Tips' },
      { value: 'College Reviews', label: 'College Reviews' },
      { value: 'Admission Updates', label: 'Admission Updates' },
    ]},
    { name: 'tags', label: 'Tags (comma-separated)', type: 'text', isArray: true },
    { name: 'isPublished', label: 'Status', type: 'select', required: true, options: [
        { value: 'true', label: 'Published' },
        { value: 'false', label: 'Draft' },
    ]},
    { name: 'content', label: 'Content', type: 'richtext' },
    { name: 'seo.slug', label: 'SEO Slug', type: 'text', required: true, placeholder: 'blog-post-title' },
    { name: 'seo.metaTitle', label: 'Meta Title', type: 'text', required: true },
    { name: 'seo.metaDescription', label: 'Meta Description', type: 'textarea' },
    { name: 'seo.keywords', label: 'Keywords (comma-separated)', type: 'text' },
];

export const enquiryFormFields: FormField[] = [
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'New', label: 'New' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
  ]},
  { name: 'assignedTo', label: 'Assign To', type: 'select', required: true, options: [
    { value: 'Admin', label: 'Admin' },
    { value: 'Support Team', label: 'Support Team' },
    { value: 'Admissions', label: 'Admissions' },
  ]},
];

export const eventFormFields: FormField[] = [
  { name: 'name', label: 'Event Name', type: 'text', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'time', label: 'Time', type: 'text', placeholder: '10:00 AM' },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'status', label: 'Event Status', type: 'select', required: true, options: [
      { value: 'Upcoming', label: 'Upcoming' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Cancelled', label: 'Cancelled' },
  ]},
  { name: 'isPublished', label: 'Publish Status', type: 'select', required: true, options: [
      { value: 'true', label: 'Published' },
      { value: 'false', label: 'Draft' },
  ]},
  { name: 'registrationLink', label: 'Registration Form Link', type: 'text', placeholder: 'https://forms.example.com/event-reg' },
  { name: 'image', label: 'Event Banner URL', type: 'image' },
  { name: 'description', label: 'Description', type: 'richtext' },
];

export const userFormFields: FormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'role', label: 'Role', type: 'select', required: true, options: [
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Editor', label: 'Editor' },
    { value: 'Viewer', label: 'Viewer' },
  ]},
];
