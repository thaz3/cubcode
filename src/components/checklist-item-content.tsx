"use client";

import DOMPurify from "isomorphic-dompurify";
import ReactMarkdown from "react-markdown";

const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br", "a", "span", "p"],
  ALLOWED_ATTR: ["href", "title"],
};

let sanitizeHooksRegistered = false;

function sanitizeChecklistHtml(html: string): string {
  if (!sanitizeHooksRegistered) {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    sanitizeHooksRegistered = true;
  }
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

type ChecklistItemContentProps = {
  content: string;
  className?: string;
};

export function ChecklistItemContent({
  content,
  className = "",
}: ChecklistItemContentProps) {
  if (HTML_TAG_PATTERN.test(content)) {
    return (
      <span
        className={`checklist-rich [&_a]:text-amber-700 [&_a]:underline dark:[&_a]:text-amber-400 ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeChecklistHtml(content) }}
      />
    );
  }

  return (
    <span
      className={`checklist-markdown [&_a]:text-amber-700 [&_a]:underline dark:[&_a]:text-amber-400 ${className}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <span className="inline">{children}</span>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  );
}
