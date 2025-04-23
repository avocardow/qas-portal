// TypeScript declaration for dompurify module
// Allows importing dompurify without type errors in Next.js build

declare module "dompurify" {
  /**
   * Sanitize HTML string to prevent XSS attacks.
   * @param dirty - The unsafe HTML string.
   * @returns The sanitized HTML string safe to render.
   */
  export function sanitize(dirty: string): string;

  /**
   * Default export with sanitize method.
   */
  const DOMPurify: {
    sanitize: typeof sanitize;
  };
  export default DOMPurify;
}
