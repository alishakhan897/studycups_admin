import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";

const BlogEditor = ({ onChange }) => {
  const editorRef = useRef(null);
  const holderRef = useRef(null);
  const initializedRef = useRef(false); // StrictMode fix

  useEffect(() => {
    if (initializedRef.current) return;
    if (!holderRef.current) return;

    initializedRef.current = true;

    const editor = new EditorJS({
      holder: holderRef.current,
      autofocus: true,
      placeholder: "Start writing your blog here...",
      minHeight: 200,

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
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              success: 1,
              file: {
                url: reader.result, // ✅ base64
              },
            });
          };
          reader.readAsDataURL(file);
        });
      },
    },
  },
},

      },

      onChange: async () => {
        const data = await editor.save();
        onChange(data);
      },
    });

    editorRef.current = editor;

    // ❌ destroy mat karo (DEV StrictMode fix)
    return () => {};
  }, []);

  return (
    <div className="border rounded-lg p-4 bg-white min-h-[260px]">
      {/* Helper text */}
      <p className="text-sm text-gray-500 mb-2">
        Press <b>Enter</b> to write • Press <b>/</b> for heading, list, image
      </p>

      <div ref={holderRef} />
    </div>
  );
};

export default BlogEditor;
