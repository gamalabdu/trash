import React from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

const Enter = () => {

	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/home')
	}

	return (

		<div id='/' className='enter'>

			<div className='video-container'>
				<video
					className='video'
					src={ 'https://drive.google.com/uc?id=1CJrk4t9ChrfxGTU_7h6RZI-zsqI-NPsG' }
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
