import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'
import {createClient} from '@sanity/client'

const Enter = () => {

	const title = 'Enter'

	const DynamicPage = ( title : string ) => {
		useEffect(() => {
		  document.title = `TRASH - ${title}`; // Update the document title
		}, [title]);
	  }
  
	  DynamicPage(title)

	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/home')
	}

	const [ enterVideo, setEnterVideo ] = useState<string>('')


	const sanityClient = createClient({
		projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
		dataset: process.env.REACT_APP_SANITY_DATASET,
		useCdn: true, // set to `false` to bypass the edge cache
		apiVersion: '2024-01-14', // use current date (YYYY-MM-DD) to target the latest API version
		token: process.env.REACT_APP_SANITY_TOKEN,
		ignoreBrowserTokenWarning: true
	  })





	useEffect(() => {

		const fetchdata = async () => {

			await sanityClient.fetch(
				`*[_type == "enter"]{
					name,
					enterVideo{
						asset->{
						  url
						}
					},
				}`
			).then((data) => {

				setEnterVideo(data[0].enterVideo.asset.url)
				
			})
			

		}


		fetchdata()


	}, [])








	return (

		<div id='/' className='enter'>

			<div className='video-container'>
				<video
					className='video'
					src={ enterVideo }
					autoPlay
					loop
					muted
					title='YouTube video player'
					>
				</video>
			</div>


            <svg className='home-text'>
					<defs>
						<mask id='mask' x='0' y='0' width='100%' height='100%'>
							<rect x='0' y='0' width='100%' height='100%' />
							<text
								className='trashText'
								x='50%'
								y='50%'
								fill='red'
								textAnchor='middle'>
								{' '}
								TRASH{' '}
							</text>
						</mask>
					</defs>
					<rect x='0' y='0' width='100%' height='100%' />
			</svg>




			<div
				className='enterBtn'
				style={{
					backgroundColor: 'transparent',
					color: 'white',
					width: '100%',
					height: '50px',
					marginTop: '-17em',
				}}>
				<button onClick={() => handleClick()}> ENTER </button>
			</div>

		</div>

	)
}

export default Enter
