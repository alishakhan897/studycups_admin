import React, { useEffect, useState } from "react";

/* 🔥 Reuse your existing SmartRenderer */
import SmartRenderer from "./SmartRenderer";

interface CollegeEditPageProps {
  collegeId: number;
  onBack: () => void;
}

const CollegeEditPage: React.FC<CollegeEditPageProps> = ({
  collegeId,
  onBack
}) => {
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================== FETCH COLLEGE ================== */
  useEffect(() => {
    let mounted = true;

    const loadCollege = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://studycupsbackend-wb8p.onrender.com/api/colleges/${collegeId}`
        );
        const json = await res.json();

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

    loadCollege();

    return () => {
      mounted = false;
    };
  }, [collegeId]); 

  const buildSavePayload = (college: any) => {
  const payload = { ...college };

  // ❌ REMOVE legacy fields (VERY IMPORTANT)
  // ✅ ENSURE CMS STRUCTURE EXISTS
  payload.content = payload.content || {};
  payload.content.about = payload.content.about || {
    title: "About College",
    blocks: []
  };

  return payload;
};


  /* ================== SAVE ================== */
  const handleSave = async () => {
  if (!college) return;

  try {
    setSaving(true);

    const payload = buildSavePayload(college);

    const res = await fetch(
      `https://studycupsbackend-wb8p.onrender.com/api/colleges/${collegeId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const json = await res.json();

    if (!json.success) {
      throw new Error("Save failed");
    }

    alert("College saved successfully");
    onBack();
  } catch (err: any) {
    alert(err.message || "Failed to save college");
  } finally {
    setSaving(false);
  }
};

  /* ================== UI STATES ================== */
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading college data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
        <div className="mt-4">
          <button
            onClick={onBack}
            className="text-blue-600 underline"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (!college) {
    return null;
  }

  /* ================== MAIN EDIT PAGE ================== */
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 text-sm mb-2"
          >
            ← Back to Colleges
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Edit College
          </h1>

          <p className="text-sm text-gray-500">
            {college.name}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-6 py-2 rounded text-white ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ===== FULL JSON EDITOR ===== */}
      <div className="space-y-4">
        <SmartRenderer
          value={college}
          onChange={setCollege}
        />
      </div>
    </div>
  );
};

export default CollegeEditPage;
