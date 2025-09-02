export default function ShaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0, background: 'black', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
} 