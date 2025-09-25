import React, { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import SideNav from '../SideNav/SideNav'
import Footer from '../Footer/Footer'
import { FiArrowDown } from 'react-icons/fi'
import { IoChatboxOutline } from 'react-icons/io5'
import './styles.css'

const NavContainer = () => {
	const [showChatIcon, setShowChatIcon] = useState(false)
	const [showArrowIcon, setShowArrowIcon] = useState(false)

	const scrollToBottom = () => {
		const scrollHeight = document.documentElement?.scrollHeight || 0
		const innerHeight = window?.innerHeight || 0

		if (scrollHeight > 0) {
			window.scrollTo({
				top: scrollHeight - innerHeight,
				behavior: 'smooth',
			})
		}
	}

	useEffect(() => {
		const toggleVisibility = () => {
			const scrollHeight = document.documentElement?.scrollHeight || 0
			const pageYOffset = window?.pageYOffset || 0
			const innerHeight = window?.innerHeight || 0
			
			const isAtTop = pageYOffset <= 10
			const isAtBottom = pageYOffset + innerHeight >= scrollHeight - 50
			
			// Show icons only when scrolling in the middle of the page
			const shouldShowIcons = !isAtTop && !isAtBottom
			setShowChatIcon(shouldShowIcons)
			setShowArrowIcon(shouldShowIcons)
		}

		window?.addEventListener('scroll', toggleVisibility)
		return () => window?.removeEventListener('scroll', toggleVisibility)
	}, [])

	return (
		<div className='nav-container'>
			<SideNav />
			<Outlet />
			
			<div className='scroll-icons-container'>
				{showArrowIcon && (
					<div className='scroll-icon arrow-icon'>
						<FiArrowDown 
							size={20} 
							onClick={scrollToBottom} 
							id='scrollToTopBtn' 
						/>
					</div>
				)}
				{showChatIcon && (
					<div className='scroll-icon chat-icon'>
						<Link to='/contact' style={{ textDecoration: 'none' }}>
							<IoChatboxOutline size={20} />
						</Link>
					</div>
				)}
			</div>

			<Footer />
		</div>
	)
}

export default NavContainer