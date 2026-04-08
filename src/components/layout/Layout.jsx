import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: 'var(--color-fondo-rosa)' 
    }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;