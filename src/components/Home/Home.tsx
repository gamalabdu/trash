import React, { useEffect } from 'react'
import './styles.css'
import { Link, useNavigate } from 'react-router-dom'
import { motion} from 'framer-motion'

const Home = () => {

	const title = 'Home'

	const DynamicPage = ( title : string ) => {
		useEffect(() => {
		  document.title = `TRASH - ${title}`; // Update the document title
		}, [title]);
	  }
  
	  DynamicPage(title)
  
	const navigate = useNavigate()

	const handleClick = (link: string) => {
		if (link === 'for-artist') {
			navigate('/for-artist')
		}
		if (link === 'for-clients') {
			navigate('/for-clients')
		}
	}




	const fadeOut = {
		hidden: {
          	opacity: 0,
	        // y: 200,
		},
		show : {
      		opacity: 1,
			// y: 0,
			transition: {
				ease : 'easeInOut',
				duration: 1.6,
			}
		},
		exit : {
            opacity: 0,
			// y: -200,
			transition : {
				ease : 'easeInOut',
				duration: 1.6,
			}
		}
	} 


	return (
		<motion.div className='home-container'
		initial='hidden'
		animate='show'
		exit='exit'
		variants={fadeOut}
		>

			<div className='we-are-text'>
				<img style={{ height: '70px' }} src={'https://drive.google.com/uc?id=13NFKppPpdsXM81vNdJdkRYJLfCJME-Dj'} alt='burningTrash' />
	            WE ARE THE CREATIVE POWERHOUSE BEHIND EMERGING ARTISTS, STARTUPS AND
				BRANDS.
			</div>

			<div id='process' className='music-production-text'>
				HERE AT TRASH WE LOOK TO HELP YOU BRING YOUR ART, BUSINESS OR IDEAS TO
				LIFE.
				<br />
				TRASH IS A FULL IN-HOUSE CREATIVE AGENCY OFFERING MUSIC PRODUCTION,
				AUDIO ENGINEERING, PHOTOGRAPHY, CREATIVE DIRECTION, GRAPHIC DESIGN,
				MARKETING & CONTENT CREATION.
			</div>

			<div className='client-offers'>
				<div onClick={() => handleClick('for-artist')} className='for-artist'>
					<div className='inside-text'> for artist </div>
					<Link to='/for-artist' style={{ textDecoration: 'none' }}>
						<img
							className='artist'
							src={'https://drive.google.com/uc?id=1No6jQZ5OYqTDExdvWF0C3mY8HCMWJmZz'}
							alt='joe'
						/>
					</Link>
				</div>

				<div
					onClick={() => handleClick('for-clients')}
					className='for-startups'>
					<div className='inside-text'> for startups </div>
					<Link to='/for-clients' style={{ textDecoration: 'none' }}>
						{' '}
						<img
							className='client'
							src={'https://drive.google.com/uc?id=1IVNSl0GJZ3xtCoBMEGr1SHjfKXBTl9px'}
							alt='mike'
						/>{' '}
					</Link>
				</div>
			</div>

		</motion.div>
	)
}

export default Home
