import { useEffect, useState } from 'react'
import './styles.css'
import { Link, useNavigate } from 'react-router-dom'
import { motion} from 'framer-motion'
import { createClient } from '@sanity/client'

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
		if (link === 'for-artists') {
			navigate('/for-artists')
		}
		if (link === 'for-clients') {
			navigate('/for-clients')
		}
	}

	type HomeData = {
			title: string,
			homePic1 : string,
			homePic2 : string,
			icon: string
	}


	const [ homeData, setHomeData ] = useState<HomeData>()


	const sanityClient = createClient({
		projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
		dataset: process.env.REACT_APP_SANITY_DATASET,
		useCdn: true, // set to `false` to bypass the edge cache
		apiVersion: '2024-01-14', // use current date (YYYY-MM-DD) to target the latest API version
		token: process.env.REACT_APP_SANITY_TOKEN,
		ignoreBrowserTokenWarning: true
	  })


	useEffect(() => {

		const response = sanityClient.fetch(`
			*[_type == "home"]{
				name,
				homePic1{
					asset -> {
						url
					}
				},
				homePic2{
					asset -> {
						url
					}
				},
				titleIcon{
					asset -> {
						url
					}
				},
			}

			`
		).then( (data) => {

	    let responseData = data[0]

		setHomeData({
			title: responseData.name,
			homePic1: responseData.homePic1.asset.url,
			homePic2: responseData.homePic2.asset.url,
			icon: responseData.titleIcon.asset.url
		})

		

	   })


	}, [])
	




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
				<img style={{ height: '70px' }} src={homeData?.icon} alt='burningTrash' />
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
				<div onClick={() => handleClick('for-artists')} className='for-artist'>
					<div className='inside-text'> for artists </div>
					<Link to='/for-artists' style={{ textDecoration: 'none' }}>
						<img
							className='artist'
							src={homeData?.homePic1}
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
							src={homeData?.homePic2}
							alt='mike'
						/>{' '}
					</Link>
				</div>
			</div>

		</motion.div>
	)
}

export default Home
