import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import Marker from "@editorjs/marker";

const BlogEditor = ({ onChange, mode = "add", initialData = null }) => {
  const holderRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!holderRef.current) return;
    if (isInitialized.current) return;
    isInitialized.current = true;

    let editorData = { blocks: [] };

    // EDIT MODE → backend data
    if (mode === "edit" && initialData?.blocks) {
      editorData = initialData;
    }

    // ADD MODE → draft restore
    if (mode === "add") {
      try {
        const raw = localStorage.getItem("blog_draft");
        if (raw) editorData = JSON.parse(raw);
      } catch {
        localStorage.removeItem("blog_draft");
      }
    }

    const editor = new EditorJS({
      holder: holderRef.current,
      autofocus: true,
      minHeight: 250,
      placeholder: "Start writing your blog here...",
      data: editorData,

      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: { levels: [2, 3, 4], defaultLevel: 2 },
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
            actions: [
      {
        name: "align-left",
        title: "Align Left",
        action: (_, api) => {
          api.blocks.update(api.blocks.getCurrentBlockIndex(), {
            align: "left",
          });
        },
      },
      {
        name: "align-center",
        title: "Align Center",
        action: (_, api) => {
          api.blocks.update(api.blocks.getCurrentBlockIndex(), {
            align: "center",
          });
        },
      },
      {
        name: "align-right",
        title: "Align Right",
        action: (_, api) => {
          api.blocks.update(api.blocks.getCurrentBlockIndex(), {
            align: "right",
          });
        },
      },
    ],
            uploader: {
              uploadByFile: async (file) => {
                const formData = new FormData();
                formData.append("image", file);

                const res = await fetch(
                  "https://studycupsbackend-wb8p.onrender.com/api/blogs/upload-image",
                  { method: "POST", body: formData }
                );

                return await res.json();
              },
              uploadByUrl: async (url) => ({
                success: 1,
                file: { url },
              }),
            },
          },
        },
      },

      onChange: async () => {
        const data = await editor.save();
        if (mode === "add") {
          localStorage.setItem("blog_draft", JSON.stringify(data));
        }
        onChange(data);
      },
    });

    // ❌ NO destroy (EditorJS + React 18 safe)
  }, [mode, initialData]);

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
