import React from 'react'
import  burningTrash  from '../../assets/images/burningtrash.svg'
import joe from '../../assets/images/joe.jpg'
import mike from '../../assets/images/mike.jpg'
import './styles.css'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {
  
	const navigate = useNavigate()

	const handleClick = (link: string) => {
		if (link === 'for-artist') {
			navigate('/for-artist')
		}
		if (link === 'for-clients') {
			navigate('/for-clients')
		}
	}


	console.log(mike)

	return (
		<div className='home-container'>

			<div className='we-are-text'>
				{/* <img style={{ height: '70px' }} src={burningTrash} alt='burningTrash' /> */}
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
							src={ joe }
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
							src={mike}
							alt='mike'
						/>{' '}
					</Link>
				</div>
			</div>

		</div>
	)
}

export default Home
