import { useEffect, useState } from "react";
import BlogEditor from "./BlogEditor";

interface AddBlogProps {
  blogId: string | null;
  onBack: () => void;
}

const AddBlog = ({ blogId, onBack }: AddBlogProps) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    date: "",
    category: "",
    imageUrl: "",
    excerpt: "",
    content: null,
  });

  // ✅ EDIT MODE → fetch blog
  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      try {
        const res = await fetch(
          `https://studycupsbackend-wb8p.onrender.com/api/blogs/${blogId}`
        );
        const json = await res.json();

        setFormData({
          title: json.data.title || "",
          author: json.data.author || "",
          date: json.data.date || "",
          category: json.data.category || "",
          imageUrl: json.data.imageUrl || "",
          excerpt: json.data.excerpt || "",
          content: json.data.content || null,
        });
      } catch (e) {
        alert("Failed to load blog");
      }
    };

    fetchBlog();
  }, [blogId]);

  // ✅ ADD MODE → restore draft
  useEffect(() => {
    if (blogId) return;

    const saved = localStorage.getItem("blog_draft_content");
    if (saved) {
      setFormData((p) => ({ ...p, content: JSON.parse(saved) }));
    }
  }, [blogId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const url = blogId
      ? `https://studycupsbackend-wb8p.onrender.com/api/blogs/${blogId}`
      : `https://studycupsbackend-wb8p.onrender.com/api/blogs`;

    const method = blogId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    localStorage.removeItem("blog_draft_content");
    onBack();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          {blogId ? "Edit Blog" : "Add New Blog"}
        </h1>
        <button onClick={onBack} className="text-blue-600">
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded space-y-6">
        <input
          placeholder="Blog Title"
          value={formData.title}
          onChange={(e) =>
            setFormData((p) => ({ ...p, title: e.target.value }))
          }
          className="w-full border p-2"
        />

        <input
          placeholder="Author"
          value={formData.author}
          onChange={(e) =>
            setFormData((p) => ({ ...p, author: e.target.value }))
          }
          className="w-full border p-2"
        />

        <BlogEditor
          content={formData.content}
          onChange={(data) =>
            setFormData((p) => ({ ...p, content: data }))
          }
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          {blogId ? "Update Blog" : "Publish Blog"}
        </button>
      </form>
    </div>
  );
};

export default AddBlog;
