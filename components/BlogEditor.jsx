import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import Marker from "@editorjs/marker";


const BlogEditor = ({ onChange }) => {
  const holderRef = useRef(null);
  const isInitialized = useRef(false); // React StrictMode fix

  useEffect(() => {
    if (!holderRef.current) return;
    if (isInitialized.current) return;
    isInitialized.current = true;

    // ✅ Draft restore (safe)
    let savedDraft = null;
    try {
      const raw = localStorage.getItem("blog_draft");
      if (raw) savedDraft = JSON.parse(raw);
    } catch (e) {
      console.warn("Invalid draft, clearing");
      localStorage.removeItem("blog_draft");
    }

    const editor = new EditorJS({
      holder: holderRef.current,
      autofocus: true,
      minHeight: 250,
      placeholder: "Start writing your blog here...",

      // ✅ Restore content if exists
      data: savedDraft || { blocks: [] },

      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },

        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },

        list: {
          class: List,
          inlineToolbar: true,
        },
        marker: {
    class: Marker,
    shortcut: "CMD+SHIFT+M",
  },

        image: {
          class: ImageTool,
          config: {
            captionPlaceholder: "Caption",

            // 🔗 EXTRA ACTION: Paste image URL manually
            actions: [
              {
                name: "paste-url",
                title: "Paste image URL",
                icon: "<svg width='14' height='14'><path d='M3 7h8'/></svg>",
                action: async (_, api) => {
                  const url = prompt("Paste image URL");
                  if (!url) return;

                  api.blocks.insert("image", {
                    file: { url },
                    caption: "",
                  });
                },
              },
            ],

            uploader: {
              // 📁 OPTION 1: Upload from system → Cloudinary
              uploadByFile: async (file) => {
                const formData = new FormData();
                formData.append("image", file);

                const res = await fetch(
                  "https://studycupsbackend-wb8p.onrender.com/api/blogs/upload-image",
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                return await res.json();
                // expected:
                // { success: 1, file: { url } }
              },

              // 🔗 OPTION 2: Direct image URL (NO upload)
              uploadByUrl: async (url) => {
                return {
                  success: 1,
                  file: { url },
                };
              },
            },
          },
        },
      },

      // 🔐 AUTO SAVE DRAFT
      onChange: async () => {
        const data = await editor.save();
        localStorage.setItem("blog_draft", JSON.stringify(data));
        onChange(data);
      },
    });

    // ❌ destroy intentionally NOT used (EditorJS + React 18 safe)
  }, []);

  return (
    <div className="border rounded-lg p-4 bg-white min-h-[300px]">
      <p className="text-sm text-gray-500 mb-2">
        Draft auto-saved • Press <b>/</b> for heading, list, image
      </p>
      <div ref={holderRef} />
    </div>
  );
};

export default BlogEditor;
