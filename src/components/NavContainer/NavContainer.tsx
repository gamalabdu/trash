
import React, { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import SideNav from '../SideNav/SideNav'
import Footer from '../Footer/Footer'
import { FiArrowDown } from 'react-icons/fi'
import { IoChatboxOutline } from 'react-icons/io5'
import './styles.css'



const NavContainer = () => {

	

	const [isVisible, setIsVisible] = useState(false)


	const scrollToBottom = () => {

		const scrollHeight = document.documentElement?.scrollHeight || 0;
	
		if (scrollHeight > 0) {
			window.scrollTo({
				top: scrollHeight,
				behavior: 'smooth',
			});
		}
	};



	useEffect(() => {

		const toggleVisibility = () => {

			const scrollHeight = document.documentElement?.scrollHeight || 0;

			const pageYOffset = window?.pageYOffset || 0;
			const innerHeight = window?.innerHeight || 0;
			
			if (pageYOffset > 50 && !(pageYOffset + 50 >= scrollHeight + 10 - innerHeight + 10)) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};
	
		window?.addEventListener('scroll', toggleVisibility);
	
		return () => {
			window?.removeEventListener('scroll', toggleVisibility);
		};
	}, []);
	

	return (
		<div className='nav-container'>
			
			<SideNav />
			
			<Outlet />

				<div className={ isVisible ? 'scroll-to-top' : 'scroll-to-top-active'}>
					<FiArrowDown size={20} 
					onClick={() => scrollToBottom() } 
					id='scrollToTopBtn' />
					<Link to='/contact' style={{textDecoration:"none"}}>
					  <IoChatboxOutline size={20} />
				    </Link>
				</div>

			<Footer />
		</div>
	)
}

export default NavContainer













