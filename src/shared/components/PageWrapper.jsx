/**
 * PageWrapper — wrapper estándar para páginas del dashboard.
 */
const PageWrapper = ({ children }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    {children}
  </div>
);

export default PageWrapper;
