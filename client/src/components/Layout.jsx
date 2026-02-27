import Navbar from "./Navbar";

export default function Layout({ title, subtitle, children }) {
  return (
    <>
      <Navbar />
      <div className="container">
        {(title || subtitle) && (
          <div style={{ marginBottom: 14 }}>
            {title && <h2 style={{ margin: "12px 0 6px" }}>{title}</h2>}
            {subtitle && <p className="muted" style={{ margin: 0 }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </>
  );
}