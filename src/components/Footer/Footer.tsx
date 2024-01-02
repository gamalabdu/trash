import React, { useEffect, useState } from 'react'
import { FaInstagram } from 'react-icons/fa'
import { AiOutlineYoutube } from 'react-icons/ai'
import { TbBrandSpotify } from 'react-icons/tb'
import './styles.css'
import { Link } from 'react-router-dom'

const Footer = () => {

    const goToLink = (linkType: string) => {
		switch (linkType) {
			case 'youtube':
				return (window.location.href = 'https://www.youtube.com/@AlejandroRodriguez-rs1zh')
			case 'instagram':
				return (window.location.href = 'https://www.instagram.com/trashdidthis/')
			case 'spotify':
				return (window.location.href = 'https://open.spotify.com/playlist/0c7YI4ChRX1SuI6Z5QYAmX?si=5c5fe817650d4d7b')
			default:
				break
		}
	}



    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);




  return (
    <footer className='footer-container'>

    {
        
        isMobile ? 

        <div className='footer-black'>

            <div className={'left-side-mobile'}>

                    <ul className='left-links-mobile'>
                        <Link to='/home'><li onClick={() => window.scrollTo(0, 0)}>Services</li></Link>
                        <Link to='/works'><li>Work</li></Link>
                        <Link to='/about'><li>About Us</li></Link>
                        <Link to='/contact'><li>Contact</li></Link>
                    </ul>

                <div className='left-lower-links-mobile'>TRASH | CREATIVE AGENCY | ARTISTS, STARTUPS, BRANDS</div>

            </div>


        </div>

        :

        <div className='footer-black'>

            <div className='left-side'>

                    <ul className='left-links'>
                        <Link to='/home'><li onClick={() => window.scrollTo(0, 0)}>Services</li></Link>
                        <Link to='/works'><li>Work</li></Link>
                        <Link to='/about'><li>About Us</li></Link>
                        <Link to='/contact'><li>Contact</li></Link>
                    </ul>

                <div className='left-lower-links'>TRASH | CREATIVE AGENCY | ARTISTS, STARTUPS, BRANDS</div>

            </div>


            {/* <div className='trash-can'>
               <img style={{ height:"7vw" }} src={'https://drive.google.com/uc?id=13NFKppPpdsXM81vNdJdkRYJLfCJME-Dj'} alt='trash-can'/>
            </div> */}

            {/* <div style={{ fontSize:"5vmin"}}>
                TRASH 
            </div> */}


            <div className='right-side'>

                    <ul className='right-links'>
                        <li className='social-icons' onClick={() => goToLink('instagram') }><FaInstagram/></li>
                        <li className='social-icons' onClick={() => goToLink('youtube') }><AiOutlineYoutube/></li>
                        <li className='social-icons' onClick={() => goToLink('spotify') }><TbBrandSpotify/></li>
                    </ul>

                <div className='right-lower-links'>©2023 TRASH STUDIO, LLC. ALL RIGHTS RESERVED</div>


            </div>



        </div>
    
    }

    </footer>
  )
}

export default Footer