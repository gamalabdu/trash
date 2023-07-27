import React from 'react'
import { Icon } from '@iconify-icon/react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from "swiper";
import 'swiper/css'
import 'swiper/css/navigation'
import './styles.css'

interface IPhoneProps {
	images: string[]
}

const IPhone = (props: IPhoneProps) => {

	const { images } = props

	return (
		<div className='device'>
			<div className='status'>
				<div className='time'>9:41</div>
				<div className='blank'></div>
				<div className='icons'>
					<Icon icon='ic:round-signal-cellular-alt' inline />
					<Icon icon='ic:round-wifi' inline />
					<Icon icon='gg:battery-full' inline />
				</div>
			</div>
			<div className='floating'>
				<div className='camera'>
					<div className='blob white'></div>
					<div className='blob bbg'></div>
					<div className='blob green'></div>
					<div className='blob red'></div>
				</div>
			</div>
			<div className='home'></div>

			<div className='avatar' style={{ backgroundImage: `${images}` }}>
				<Swiper
					modules={[Navigation]}
					spaceBetween={100}
					slidesPerView={1}
					navigation={true}
					className='mySwiper'>
					{
					  images.map((photo, idx) => {
						return (
							<SwiperSlide key={idx}>
									<img className='phone-image' src={photo} alt='iphone' />
							</SwiperSlide>
						)
					})}
				</Swiper>
			</div>

			{/* <div className='buttons'>
				<div className='btn'>
					<div className='icon'>
						<Icon icon='tabler:message-circle-2-filled' />
					</div>
					<div className='label'>Message</div>
				</div>
				<div className='btn'>
					<div className='icon'>
						<Icon icon='ic:round-voicemail' />
					</div>
					<div className='label'>Voicemail</div>
				</div>
			</div> */}
		</div>
	)
}

export default IPhone
