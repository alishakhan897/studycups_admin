import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";

const BlogEditor = ({ onChange, content }) => {
  const editorRef = useRef(null);
  const holderRef = useRef(null);

  useEffect(() => {
    if (!holderRef.current) return;

    // 🔥 destroy old editor
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }

    const editor = new EditorJS({
      holder: holderRef.current,
      autofocus: true,
      placeholder: "Start writing your blog here...",
      minHeight: 200,

      // ✅ PREFILL CONTENT
      data: content ?? { blocks: [] },

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
        image: {
          class: ImageTool,
          config: {
            uploader: {
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
              },
            },
          },
        },
      },

      onChange: async () => {
        const data = await editor.save();
        onChange(data);
        localStorage.setItem(
          "blog_draft_content",
          JSON.stringify(data)
        );
      },
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
    };
  }, [content]); // 🔥 MOST IMPORTANT

  return (
    <div className="border rounded-lg p-4 bg-white min-h-[260px]">
      <p className="text-sm text-gray-500 mb-2">
        Press <b>Enter</b> to write • Press <b>/</b> for heading, list, image
      </p>
      <div ref={holderRef} />
    </div>
  );
};

export default BlogEditor;
