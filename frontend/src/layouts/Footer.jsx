import { Link } from 'react-router-dom'
import { MdSchool, MdPhone, MdEmail, MdLocationOn } from 'react-icons/md'
import { useState, useEffect } from 'react'

export default function Footer({ noSidebar = false }) {
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down
                setIsVisible(false)
            } else {
                // Scrolling up
                setIsVisible(true)
            }
            setLastScrollY(currentScrollY)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    return (
        <footer className={`fixed-footer ${noSidebar ? 'no-sidebar' : ''} ${isVisible ? 'ff-visible' : 'ff-hidden'}`}>
            <div className="ff-inner">

                {/* Brand / Left */}
                <div className="ff-brand-col">
                    <div className="ff-logo-wrap">
                        <div className="ff-logo"><MdSchool size={16} /></div>
                        <span className="ff-brand-text">DocLibrary</span>
                    </div>
                    <p className="ff-desc">
                        The official document management system for KAFU. Providing secure, efficient, and compliant digital archiving.
                    </p>
                </div>

                {/* Links / Center */}
                <div className="ff-links-col">
                    <div className="ff-title">Quick Links</div>
                    <div className="ff-link-grid">
                        <Link to="/about">About System</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/help">Help Center</Link>
                    </div>
                </div>

                {/* Contact / Right */}
                <div className="ff-contact-col">
                    <div className="ff-title">Contact IT Support</div>
                    <div className="ff-contact-item">
                        <MdPhone size={14} /> <span>+254 700 000 000</span>
                    </div>
                    <div className="ff-contact-item">
                        <MdEmail size={14} /> <span>support@kafu.ac.ke</span>
                    </div>
                    <div className="ff-contact-item">
                        <MdLocationOn size={14} /> <span>Kaimosi, Kenya</span>
                    </div>
                </div>

            </div>

            <div className="ff-bottom">
                &copy; {new Date().getFullYear()} Kaimosi Friends University. All rights reserved.
            </div>

            <style>{`
        /* SKY BLUISH DETAILED FIXED FOOTER */
        .fixed-footer {
          position: fixed;
          bottom: 0; left: var(--sidebar-width); right: 0;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          border-top: 1px solid rgba(255,255,255,0.2);
          z-index: 40;
          color: white;
          box-shadow: 0 -4px 20px rgba(2,132,199,0.25);
          font-family: var(--font-body);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ff-visible { transform: translateY(0); }
        .ff-hidden { transform: translateY(100%); }
        .fixed-footer.no-sidebar { left: 0; }
        
        .ff-inner {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 20px;
        }

        .ff-brand-col { flex: 1.5; max-width: 320px; }
        .ff-logo-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .ff-logo {
          width: 26px; height: 26px; border-radius: 6px;
          background: white; color: #0284c7;
          display: flex; align-items: center; justify-content: center;
        }
        .ff-brand-text { font-family: var(--font-heading); font-size: 15px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .ff-desc { font-size: 11.5px; color: rgba(255,255,255,0.8); line-height: 1.5; }

        .ff-links-col { flex: 1; }
        .ff-title { font-family: var(--font-heading); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; opacity: 0.9; }
        .ff-link-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
        .ff-link-grid a { color: rgba(255,255,255,0.8); font-size: 11.5px; text-decoration: none; transition: color 0.2s; }
        .ff-link-grid a:hover { color: white; text-decoration: underline; }

        .ff-contact-col { flex: 1; }
        .ff-contact-item { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: rgba(255,255,255,0.8); margin-bottom: 6px; }

        .ff-bottom {
          text-align: center;
          padding: 8px;
          font-size: 10.5px;
          color: rgba(255,255,255,0.7);
          background: rgba(0,0,0,0.15);
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        @media (max-width: 768px) {
          .fixed-footer:not(.no-sidebar) { left: 0; display: none; /* Hide detailed footer on mobile, BottomNav takes over */ }
        }
      `}</style>
        </footer>
    )
}
