import React, { useEffect, useState } from "react";
import SmartRenderer from "./SmartRenderer";

interface ExamEditPageProps {
  examId: number;
  onBack: () => void;
}

const ExamEditPage: React.FC<ExamEditPageProps> = ({
  examId,
  onBack,
}) => {
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================== FETCH EXAM ================== */
  useEffect(() => {
    let mounted = true;

    const loadExam = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://studycupsbackend-wb8p.onrender.com/api/exams/${examId}`
        );
        const json = await res.json();

        if (!json.success) {
          throw new Error("Exam not found");
        }

        if (mounted) {
          setExam(json.data);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to load exam");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadExam();

    return () => {
      mounted = false;
    };
  }, [examId]);

  /* ================== SAVE ================== */
  const handleSave = async () => {
    if (!exam) return;

    try {
      setSaving(true);

      const res = await fetch(
        `https://studycupsbackend-wb8p.onrender.com/api/exams/${examId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(exam),
        }
      );

      const json = await res.json();

      if (!json.success) {
        throw new Error("Save failed");
      }

      alert("Exam updated successfully");
      onBack();
    } catch (err: any) {
      alert(err.message || "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  /* ================== UI STATES ================== */
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading exam data…
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
            ← Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return null;

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
            ← Back to Exams
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Edit Exam
          </h1>

          <p className="text-sm text-gray-500">
            {exam.name}
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

      {/* ===== FULL CMS EDITOR ===== */}
      <SmartRenderer
        value={exam}
        onChange={setExam}
      />
    </div>
  );
};

export default ExamEditPage;
