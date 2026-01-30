
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DataManagement } from './components/DataManagement'; 
import CollegeScraperDashboard from "./components/ScrapedColleges";
import { Settings } from './components/Settings'; 
import CollegeEditPage from './components/CollegeEditPage';
import { collegeApi, courseApi, examApi, blogApi, enquiryApi, eventApi } from './services/apiService';
import { collegeColumns, courseColumns, examColumns, blogColumns, enquiryColumns, eventColumns, collegeFormFields, courseFormFields, examFormFields, blogFormFields, enquiryFormFields, eventFormFields } from './constants';
import type { Page } from './types';
import ExamEditPage from "./components/ExamEditPage";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard'); 
  const [editingCollegeId, setEditingCollegeId] = useState<number | null>(null);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);



  const renderContent = () => {
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />;

    case 'colleges':
  return editingCollegeId === null ? (
    <div className="space-y-4">

      {/* ✅ YAHI HAI + ADD NEW COLLEGE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingCollegeId(null);
            setCurrentPage("editCollege");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add New College
        </button>
      </div>

      <DataManagement
        title="Colleges"
        api={collegeApi}
        columns={collegeColumns}
        formFields={collegeFormFields}
        onEditCollege={(id) => setEditingCollegeId(id)}
      />
    </div>
  ) : (
    <CollegeEditPage
      collegeId={editingCollegeId}
      onBack={() => setEditingCollegeId(null)}
    />
  );

    case 'editCollege':
      return (
        <CollegeScraperDashboard
          onBack={() => setCurrentPage("colleges")} // optional
        />
      );

    case 'courses':
      return (
        <DataManagement
          title="Courses"
          api={courseApi}
          columns={courseColumns}
          formFields={courseFormFields}
        />
      );

  case 'exams':
  return editingExamId === null ? (
    <DataManagement
      title="Exams"
      api={examApi}
      columns={examColumns}
      formFields={examFormFields}
      onEditExam={(id) => setEditingExamId(id)}   // ✅ NEW
    />
  ) : (
    <ExamEditPage
      examId={editingExamId}
      onBack={() => setEditingExamId(null)}
    />
  );

    case 'blogs':
      return <DataManagement title="Blogs" api={blogApi} columns={blogColumns} formFields={blogFormFields} />;

    case 'enquiries':
      return <DataManagement title="Enquiries" api={enquiryApi} columns={enquiryColumns} formFields={enquiryFormFields} />;

    case 'events':
      return <DataManagement title="Events" api={eventApi} columns={eventColumns} formFields={eventFormFields} />;

    case 'settings':
      return <Settings />;

    default:
      return <Dashboard />;
  }
};

  
  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    colleges: 'College Management',
    courses: 'Course Management',
    exams: 'Exam Management',
    blogs: 'Blog Management',
    enquiries: 'Enquiry Management',
    events: 'Event Management',
    settings: 'Settings', 
    editCollege: 'College Scraper Dashboard',
    editExam: 'Edit Exam',
  }

  return (
    <BrowserRouter>
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitles[currentPage]} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
    </BrowserRouter>
  );
};

export default App;
