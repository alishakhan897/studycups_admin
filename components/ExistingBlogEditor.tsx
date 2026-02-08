import { ChangeEvent, useEffect, useState } from "react";
import BlogEditor from "./BlogEditor";

type Props = {
  blogId: number;
  onBack: () => void;
};

type ExistingBlog = {
  title: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  excerpt: string;
  content: any;
};

const EMPTY_BLOG: ExistingBlog = {
  title: "",
  author: "",
  date: "",
  category: "",
  imageUrl: "",
  excerpt: "",
  content: null,
};

const ExistingBlogEditor = ({ blogId, onBack }: Props) => {
  const [formData, setFormData] = useState<ExistingBlog>(EMPTY_BLOG);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD BLOG BY ID ================= */

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const res = await fetch(
          `https://studycupsbackend-wb8p.onrender.com/api/blogs/${blogId}`
        );

        const json = await res.json();

        if (!json.success) {
          throw new Error("Failed to fetch blog");
        }

        const blog = json.data;

        setFormData({
          title: blog.title || "",
          author: blog.author || "",
          date: blog.date || "",
          category: blog.category || "",
          imageUrl: blog.imageUrl || "",
          excerpt: blog.excerpt || "",
          content: blog.content || null,
        });

        // ✅ EditorJS ko correct content dikhao
        localStorage.setItem(
          "blog_draft",
          JSON.stringify(blog.content || {})
        );
      } catch (err) {
        console.error("❌ Blog load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [blogId]);

  /* ================= INPUT HANDLERS ================= */

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= UPDATE BLOG ================= */

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `https://studycupsbackend-wb8p.onrender.com/api/blogs/${blogId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const json = await res.json();

      if (!json.success) {
        throw new Error("Update failed");
      }

      localStorage.removeItem("blog_draft");
      onBack();
    } catch (err) {
      console.error("❌ Update failed:", err);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading blog...</div>;
  }

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Edit Blog</h2>
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 space-y-6">
        <input
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="border p-3 rounded"
          />

          <input
            name="imageUrl"
            placeholder="Featured Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
            className="border p-3 rounded"
          />
        </div>

        <textarea
          name="excerpt"
          rows={3}
          placeholder="Short excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        {/* ✅ BlogEditor untouched */}
        <div>
          <label className="font-medium mb-2 block">Blog Content</label>
          <BlogEditor
  mode="edit"
  initialData={formData?.content}
  onChange={(data) =>
    setFormData(prev => ({ ...prev, content: data }))
  }
/>

        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Update Blog
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExistingBlogEditor;
