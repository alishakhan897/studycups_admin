import { useEffect, useState } from "react";
import BlogEditor from "./BlogEditor";
import { editorToHtml } from "./editorToHtml";

const AddBlog = ({ onBack }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    date: "",
    category: "",
    imageUrl: "",
    excerpt: "",
    content: null,
  });

  // ✅ Restore draft (NEW BLOG ONLY)
  useEffect(() => {
    localStorage.removeItem("blog_draft");
    localStorage.removeItem("blog_draft_content");
  }, []);
  useEffect(() => {
    const saved = localStorage.getItem("blog_draft_content");
    if (saved) {
      setFormData((p) => ({
        ...p,
        content: JSON.parse(saved),
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content?.blocks?.length) {
      alert("❌ Blog content is empty");
      return;
    }

    try {
      const res = await fetch(
        "https://studycupsbackend-wb8p.onrender.com/api/blogs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      
      if (!res.ok) throw new Error("Failed");
     

      alert("✅ Blog published successfully");
        localStorage.removeItem("blog_draft");
      localStorage.removeItem("blog_draft_content");
      onBack();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to publish blog");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Blog</h1>
        <button onClick={onBack} className="text-blue-600">
          ← Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-6"
      >
        <input
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div className="grid grid-cols-3 gap-4">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            name="imageUrl"
            placeholder="Featured Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <textarea
          name="excerpt"
          placeholder="Short excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={3}
          className="w-full border p-2 rounded"
        />

        {/* BLOG CONTENT */}
        <div>
          <label className="font-medium mb-2 block">Blog Content</label>
       <BlogEditor
  mode="add"
  onChange={(data) =>
    setFormData(prev => ({ ...prev, content: data }))
  }
/>

        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Publish Blog
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
