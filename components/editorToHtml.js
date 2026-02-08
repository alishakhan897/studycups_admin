export const decodeHtml = (html = "") => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const editorToHtml = (data) => {
  if (!data?.blocks) return "";

  return data.blocks
    .map((block) => {
      switch (block.type) {
        case "header":
          return `<h${block.data.level}>
            ${decodeHtml(block.data.text)}
          </h${block.data.level}>`;

        case "paragraph":
          return `<p>${block.data.text}</p>`;

        case "list":
          if (block.data.style === "ordered") {
            return `<ol>${block.data.items
              .map((i) => `<li>${i}</li>`)
              .join("")}</ol>`;
          }
          return `<ul>${block.data.items
            .map((i) => `<li>${i}</li>`)
            .join("")}</ul>`;

        case "image":
          return `<img src="${block.data.file.url}" />`;

        default:
          return "";
      }
    })
    .join("");
};
