import React from 'react'
import { FaInstagram } from 'react-icons/fa'
import { AiOutlineYoutube } from 'react-icons/ai'
import { TbBrandSpotify } from 'react-icons/tb'
import './styles.css'
import { Link } from 'react-router-dom'

const Footer = () => {
    const socialLinks = [
        {
            name: 'Instagram',
            icon: <FaInstagram />,
            url: 'https://www.instagram.com/trashdidthis/',
            ariaLabel: 'Follow us on Instagram'
        },
        {
            name: 'YouTube',
            icon: <AiOutlineYoutube />,
            url: 'https://www.youtube.com/@AlejandroRodriguez-rs1zh',
            ariaLabel: 'Subscribe to our YouTube channel'
        },
        {
            name: 'Spotify',
            icon: <TbBrandSpotify />,
            url: 'https://open.spotify.com/playlist/0c7YI4ChRX1SuI6Z5QYAmX?si=5c5fe817650d4d7b',
            ariaLabel: 'Listen to our Spotify playlist'
        }
    ]

    const navigationLinks = [
        { to: '/home', label: 'Services', onClick: () => window.scrollTo(0, 0) },
        { to: '/works', label: 'Work' },
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' }
    ]

    const handleSocialClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const currentYear = new Date().getFullYear()

    return (
        <footer className='footer-container' role="contentinfo">
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#1a1a1a',
                color: '#dedede',
                padding: '1rem 4rem',
                minHeight: '60px',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
                <div>
                    <nav aria-label="Footer navigation">
                        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
                            {navigationLinks.map((link, index) => (
                                <li key={index}>
                                    <Link 
                                        to={link.to} 
                                        onClick={link.onClick}
                                        style={{ color: '#dedede', textDecoration: 'none' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b6b6b' }}>
                        <span style={{ color: '#dedede', fontWeight: '600' }}>TRASH</span>
                        <span style={{ margin: '0 0.5rem', opacity: 0.6 }}>|</span>
                        <span>CREATIVE AGENCY</span>
                        <span style={{ margin: '0 0.5rem', opacity: 0.6 }}>|</span>
                        <span>ARTISTS, STARTUPS, BRANDS</span>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <button
                            onClick={() => handleSocialClick('https://www.instagram.com/trashdidthis/')}
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(222, 222, 222, 0.3)',
                                color: '#dedede',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                opacity: 0.9
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#dedede';
                                e.currentTarget.style.borderColor = 'rgba(222, 222, 222, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                                e.currentTarget.style.opacity = '0.9';
                            }}
                            title="Instagram"
                        >
                            <FaInstagram />
                        </button>
                        <button
                            onClick={() => handleSocialClick('https://www.youtube.com/@AlejandroRodriguez-rs1zh')}
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(222, 222, 222, 0.3)',
                                color: '#dedede',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                opacity: 0.9
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#dedede';
                                e.currentTarget.style.borderColor = 'rgba(222, 222, 222, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                                e.currentTarget.style.opacity = '0.9';
                            }}
                            title="YouTube"
                        >
                            <AiOutlineYoutube />
                        </button>
                        <button
                            onClick={() => handleSocialClick('https://open.spotify.com/playlist/0c7YI4ChRX1SuI6Z5QYAmX?si=5c5fe817650d4d7b')}
                            style={{ 
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(222, 222, 222, 0.3)',
                                color: '#dedede',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                opacity: 0.9
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#dedede';
                                e.currentTarget.style.borderColor = 'rgba(222, 222, 222, 0.3)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                                e.currentTarget.style.opacity = '0.9';
                            }}
                            title="Spotify"
                        >
                            <TbBrandSpotify />
                        </button>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#6b6b6b' }}>
                        © {currentYear} TRASH STUDIO, LLC. ALL RIGHTS RESERVED
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer