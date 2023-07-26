import React, { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import SideNav from '../SideNav/SideNav'
import Footer from '../Footer/Footer'
import { FiArrowDown } from 'react-icons/fi'
import { IoChatboxOutline } from 'react-icons/io5'
import './styles.css'

const NavContainer = () => {

	const [isVisible, setIsVisible] = useState(false)

	// Top: 0 takes us all the way back to the top of the page
	// Behavior: smooth keeps it smooth!
	const scrollToTop = () => {
		window.scrollTo({
			top: 100000000000,
			behavior: 'smooth',
		})
	}

	useEffect(() => {
    
		// Button is displayed after scrolling for 500 pixels
		const toggleVisibility = () => {
			if (window.pageYOffset > 50 && !( window.pageYOffset + 50 >= document.documentElement.scrollHeight + 10 - window.innerHeight + 10) ) {
				setIsVisible(true)
			} else {
				setIsVisible(false)
			}
		}

		window.addEventListener('scroll', toggleVisibility)

		return () => window.removeEventListener('scroll', toggleVisibility)

	}, [])

	return (
		<>
			<SideNav />
			<Outlet />
				<div className={ isVisible ? 'scroll-to-top' : 'scroll-to-top-active'}>
					<FiArrowDown size={20} onClick={() => scrollToTop()} id='scrollToTopBtn' />
					<Link to='/contact' style={{textDecoration:"none"}}>
					  <IoChatboxOutline size={20} />
				    </Link>
				</div>
			<Footer />
		</>
	)
}

export default NavContainer
