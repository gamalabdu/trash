import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
		navigate('/for-artists')
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


	}, [sanityClient])









	return (

		<div id='/' className='h-screen w-screen overflow-hidden relative touch-none' style={{height: '100dvh', width: '100dvw'}}>

			<div className='absolute inset-0 flex justify-center items-center'>
				<video
					className='w-full h-full object-cover'
					src={ enterVideo }
					autoPlay
					loop
					muted
					playsInline
					title='YouTube video player'
					>
				</video>
			</div>


            <svg className='absolute top-0 left-0 h-full w-full pointer-events-none text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10em] font-primary font-bold uppercase transition-all duration-1000' style={{textRendering: 'optimizeLegibility', fontKerning: 'none', WebkitFontSmoothing: 'antialiased', fontSize: 'clamp(4rem, 15vw, 10em)'}}>
					<defs>
						<mask id='mask' x='0' y='0' width='100%' height='100%'>
							<rect x='0' y='0' width='100%' height='100%' fill='white' />
							<text
								x='50%'
								y='50%'
								fill='black'
								textAnchor='middle'
								dominantBaseline='central'
								className='font-primary font-bold uppercase'
								style={{fontSize: 'clamp(4rem, 15vw, 10em)'}}>
								TRASH
							</text>
						</mask>
					</defs>
					<rect x='0' y='0' width='100%' height='100%' fill='#1b1c1e' mask='url(#mask)' />
			</svg>




			<div className='absolute bottom-0 left-0 w-full flex items-center justify-center pb-40 sm:pb-48 md:pb-56'>
				<button 
					onClick={() => handleClick()}
					className='inline-flex items-center justify-center px-12 py-6 border-2 border-gray-300 text-gray-300 bg-brand-bg cursor-pointer transition-all duration-300 ease-in-out hover:scale-130 font-primary text-xl sm:text-2xl md:text-3xl min-w-48 min-h-16'
				> 
					ENTER 
				</button>
			</div>

		</div>

	)
}

export default Enter
