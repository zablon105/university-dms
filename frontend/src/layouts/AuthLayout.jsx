// import { MdSchool } from 'react-icons/md';
// import Footer from './Footer';

export default function AuthLayout({ children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
            {/* Header temporarily disabled
            <nav style={{
                height: 'var(--topbar-height)',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px',
                position: 'sticky', top: 0, zIndex: 100,
                boxShadow: '0 2px 16px rgba(2,132,199,0.25), 0 1px 4px rgba(2,132,199,0.15)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <MdSchool style={{ color: '#0284c7', fontSize: 18 }} />
                    </div>
                    <span style={{ color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        DocLibrary
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <a href="/login" style={{ color: 'white', fontSize: 13, textDecoration: 'none', fontWeight: 500, opacity: 0.9 }}>Portal Home</a>
                    <a href="#" style={{ color: 'white', fontSize: 13, textDecoration: 'none', fontWeight: 500, opacity: 0.9 }}>Staff Webmail</a>
                    <a href="#" style={{ color: 'white', fontSize: 13, textDecoration: 'none', fontWeight: 500, opacity: 0.9 }}>E-Learning</a>
                    <a href="#" style={{ color: 'white', fontSize: 13, textDecoration: 'none', fontWeight: 500, opacity: 0.9 }}>Support</a>
                </div>
            </nav>
            */}

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex' }}>
                    {children}
                </div>
            </main>

            {/* Footer temporarily disabled
            <Footer noSidebar />
            */}
        </div>
    )
}
