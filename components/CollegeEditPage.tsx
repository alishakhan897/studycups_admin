import React, { useEffect, useState } from "react";
import SmartRenderer from "./SmartRenderer";
import CollegeCourseCms from "./CollegeCourseCms";
import { API_BASE_URL } from "../services/apiService";

interface CollegeEditPageProps {
  collegeId: number;
  onBack: () => void;
}

const CollegeEditPage: React.FC<CollegeEditPageProps> = ({
  collegeId,
  onBack,
}) => {
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingCollege, setSavingCollege] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);

  const parseApiResponse = async (res: Response) => {
    const text = await res.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        throw new Error(
          `Server returned HTML instead of JSON for ${res.url} (${res.status} ${res.statusText})`
        );
      }

      throw new Error(text);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCollege = async () => {
      try {
        setLoading(true);
        setError(null);
        setCollege(null);

        const res = await fetch(
          `${API_BASE_URL}/colleges/${collegeId}`
        );

        if (!res.ok) {
          throw new Error("Failed to load college");
        }

        const json = await parseApiResponse(res);

        if (!json.success) {
          throw new Error("College not found");
        }

        if (mounted) {
          setCollege(json.data);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load college");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const loadCourseData = async () => {
      try {
        setCourseLoading(true);
        setCourseError(null);
        setCourseData(null);

        const res = await fetch(
          `${API_BASE_URL}/college-course/college/${collegeId}`
        );

        if (!res.ok) {
          throw new Error("Failed to load course fees");
        }

        const json = await parseApiResponse(res);

        if (!json.success) {
          throw new Error("Course fees data not found");
        }

        if (mounted) {
          setCourseData(Array.isArray(json.data) ? json.data[0] ?? null : json.data ?? null);
        }
      } catch (err: any) {
        if (mounted) {
          setCourseError(err.message || "Failed to load course fees");
        }
      } finally {
        if (mounted) {
          setCourseLoading(false);
        }
      }
    };

    loadCollege();
    loadCourseData();

    return () => {
      mounted = false;
    };
  }, [collegeId]);

  const buildSavePayload = (currentCollege: any) => {
    const payload = { ...currentCollege };

    payload.content = payload.content || {};
    payload.content.about = payload.content.about || {
      title: "About College",
      blocks: [],
    };

    return payload;
  };

  const buildCourseSavePayload = (currentCourseData: any) => {
    if (!currentCourseData) {
      return null;
    }

    const payload = { ...currentCourseData };
    delete payload._id;

    return payload;
  };

  const handleSaveCollege = async () => {
    if (!college) return;

    try {
      setSavingCollege(true);

      const collegePayload = buildSavePayload(college);
      const collegeRes = await fetch(
        `${API_BASE_URL}/colleges/${collegeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(collegePayload),
        }
      );

      const collegeJson = await parseApiResponse(collegeRes);

      if (!collegeJson.success) {
        throw new Error(collegeJson.message || "College save failed");
      }

      setCollege(collegeJson.data ?? collegePayload);
      alert("College saved successfully");
    } catch (err: any) {
      alert(err.message || "Failed to save college");
    } finally {
      setSavingCollege(false);
    }
  };

  const handleSaveCourseCms = async () => {
    if (!courseData) return;

    try {
      setSavingCourse(true);

      const coursePayload = buildCourseSavePayload(courseData);
      const courseRes = await fetch(
        `${API_BASE_URL}/college-course/college/${collegeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(coursePayload),
        }
      );

      const courseJson = await parseApiResponse(courseRes);

      if (!courseJson?.success) {
        throw new Error(courseJson?.message || "Course CMS save failed");
      }

      setCourseData(Array.isArray(courseJson.data) ? courseJson.data[0] ?? null : courseJson.data ?? null);
      alert("Course CMS saved successfully");
    } catch (err: any) {
      alert(err.message || "Failed to save course CMS");
    } finally {
      setSavingCourse(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading college data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
        <div className="mt-4">
          <button onClick={onBack} className="text-blue-600 underline">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!college) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-blue-600">
            Back to Colleges
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Edit College
          </h1>

          <p className="text-sm text-gray-500">
            {college.name}
          </p>
        </div>

        <button
          onClick={handleSaveCollege}
          disabled={savingCollege}
          className={`rounded px-6 py-2 text-white ${
            savingCollege
              ? "cursor-not-allowed bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {savingCollege ? "Saving..." : "Save College"}
        </button>
      </div>

      <CollegeCourseCms
        data={courseData}
        loading={courseLoading}
        error={courseError}
        onChange={setCourseData}
        onSave={handleSaveCourseCms}
        saving={savingCourse}
      />

      <div className="space-y-4">
        <SmartRenderer value={college} onChange={setCollege} />
      </div>
    </div>
  );
};

export default CollegeEditPage;
