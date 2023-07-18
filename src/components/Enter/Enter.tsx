import React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

const Enter = () => {

	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/home')
	}

	function resizeIframe(obj: any) {
		obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px'
	}

	return (
		<div id='/' className='enter'>

			<div className='video-container'>
				<iframe
					className='video'
					src={ 'https://www.youtube.com/embed/Rb6Scz-5YOs?autoplay=1&mute=1' }
					title='YouTube video player'
					// onLoad={() => resizeIframe(this)}
					allow='accelerometer; autoplay '></iframe>
			</div>

			{/* <video
				    className='enter-video'
					width='100%'
					autoPlay
					muted
					src={trashVideo + '#t=10,1000'}></video> */}


			{/* <svg className='home-text'>
				<defs>
					<mask id='mask' maskUnits='objectBoundingBox' x='0' y='0' width='100vw' height='100vh'>
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
			</svg> */}


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

			{/* <Routes>
					<Route path='/about' element={<Site />} />
				</Routes> */}
		</div>
	)
}

export default Enter
