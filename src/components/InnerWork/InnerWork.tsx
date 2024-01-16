import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import IPhone from '../IPhone/IPhone'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import './styles.css'
import {motion} from 'framer-motion'
import { IWork } from '../../models/IWork'
import { IAsset } from '../../models/IAsset'

const InnerWork = () => {
	
	useEffect(() => {

		window.scrollTo(0, 0)

	}, [])

	const location = useLocation()

	const state = location.state

	const navigate = useNavigate()

	const [ selectedWork, setSelectedWork ] = useState<IWork>()

	const backToWork = () => {

		navigate('/works')

	}  


	useEffect(() => {
		if (state && state.item) {
		  setSelectedWork(state.item);
		}
	  }, [state]);
	
	  if (!selectedWork) {
		return null; // or display loading, error, or a placeholder component
	  }




	// let selectedWork: IWork = {

	// 	image: state.item.image.asset.url,
	// 	type: [],
	// 	name: state.item.name,
	// 	statement: state.item.statement,
	// 	videos: [...state.item.videos],
	// 	images: (state.item.images && state.item.images.map((image: IAsset) => image.asset.url || '')) || [],
	// 	canvas: (state.item.canvas && state.item.canvas.map((canvas: IAsset) => canvas.asset.url || '')) || [],
	// 	assets: (state.item.assets && state.item.assets.map((asset: IAsset) => asset.asset.url || '')) || [],
	// 	iphone: false,
	// 	artworks: (state.item.artworks && state.item.artworks.map((artwork: IAsset) => artwork.asset.url || '')) || [],

	// }


	// console.log(selectedWork)


	// const videos = [...state.item.videos]

	// let artworks: any[] = []

	// const images = [...state.item.images]

	// const iphone = state.item.iphone

	// let assets: any[] = []

	// let canvas: string[] = []

	// if (state.item.assets) {
	// 	assets = [...state.item.assets]
	// }

	// if (state.item.artworks) {
	// 	assets = [...state.item.artworks]
	// }

	// if (state.item.canvas) {
	// 	canvas = [...state.item.canvas]
	// }






	const fadeOut = {
		hidden: {
          	opacity: 0,
	        y: 200,
		},
		show : {
      		opacity: 1,
			y: 0,
			transition: {
				ease : 'easeInOut',
				duration: 1.6,
			}
		},
		exit : {
            opacity: 0,
			y: -200,
			transition : {
				ease : 'easeInOut',
				duration: 1.6,
			}
		}
	} 






	return (
		
		<motion.div className='inner-work-container'
		initial='hidden'
		animate='show'
		exit='exit'
		variants={fadeOut}
		>
			<div
				style={{
					width: '100%',
					color: 'black',
					textAlign: 'right',
					fontSize: '3vw',
					marginTop: '24px',
					marginLeft: '-70px',
					cursor: 'pointer',
				}}
				onClick={() => backToWork()}>
				{' '}
				Back{' '}
			</div>



			<div className='inner-work-main'>


				<div style={{ color: 'black', fontSize: '5vw' }}> {selectedWork?.name}  </div>


				{ 
				
				selectedWork.assets ? 
				
				
					<div className='assets'>
						{selectedWork.assets.map((asset, idx) => {
							return <img key={idx} className='asset' src={asset.asset.url} alt='asset' loading='lazy' />
						})}
					</div>


				 : 
					
					<img
						style={{ width: '100%', height: '400px', objectFit: 'cover' }}
						loading="lazy"
						alt='alt-idk'
						src={selectedWork.image.asset.url}
					/>
				
				}



				<div style={{ color: 'black', textAlign: 'center', padding: '5%', fontSize: "3vw" }}> {state.item.statement}  </div>

				<div
					style={{
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}>


					{ 
					
					selectedWork.videos &&

						selectedWork.videos.map((video, idx) => {
							return (
								<video
									key={idx}
									style={{ width: '90%', padding: '2%' }}
									src={video.asset.url ?? ""}
									loop
									autoPlay
									muted
									playsInline
								/>
							)
						})
					}


				</div>



				{ 
				
				selectedWork && selectedWork.iphone ? 
				
					<IPhone images={selectedWork.images} />

				    : 
				 
				    selectedWork && !selectedWork.iphone && selectedWork.images ?

					<div>
						<div className='inner-work-gallery'>
							<Swiper
								modules={[Navigation]}
								spaceBetween={100}
								slidesPerView={1}
								navigation={true}
								className='mySwiper'>
								{selectedWork.images.map((photo, idx) => {
									return (
										<SwiperSlide key={idx}>
											<img className='phone-image' src={photo.asset.url ?? ""} alt='idk' />
										</SwiperSlide>
									)
								})}
							</Swiper>
						</div>
					</div>
				
				
				: null
				
				}




			</div>



			{
				selectedWork.artworks ? 

				<>

				<div style={{ color: 'black', fontSize:"5vw"}}> ArtWorks </div>
			
				<div className='artworks-container'>
				{
						selectedWork.artworks.map( (artwork, key) => {
							return (
								
									<img key={key} className='artwork' loading='lazy' src={artwork.asset.url} />
							
							)
						})
			    }
				</div>

				</>

				: 
				
				null
			}
			

			{ 
			
			selectedWork.canvas ? 
				<>
					<div style={{ color: 'black', fontSize:"5vw"}}> Canvas </div>

					<div
						style={{
							padding: '2%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							alignContent: 'center',
							textAlign: 'center',
						}}>
						<div>
							{selectedWork.canvas.map((canva, idx) => {
								return (
									<video
										key={idx}
										style={{
											width: '30%',
											height: '50%',
											borderRadius: '20px',
											margin: '0 5px',
										}}
										src={canva.asset.url ?? ""}
										muted
										loop
										autoPlay
										playsInline
									/>
								)
							})}
						</div>
					</div>
				</>
			 : 
			 
			 null
			 
			}


		</motion.div>

	)




}

export default InnerWork
