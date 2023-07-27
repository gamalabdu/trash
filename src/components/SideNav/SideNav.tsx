import React from 'react'
import { useEffect } from 'react';
import './styles.css'
import { Link } from 'react-router-dom';

const SideNav = () => {

	useEffect(() => {

		const toggleNav = () => {

		  const nav = document?.getElementById('nav');

		  if (nav?.classList.contains('active')) {
			nav.classList.remove('active');
		  } else {
			nav?.classList.add('active');
		  }

		};
	
		const handleClick = () => {
		  toggleNav();
		};
	
		const navIcon = document?.getElementById('nav-icon');
		if (navIcon) {
		  navIcon?.addEventListener('click', handleClick);
		}
	
		return () => {
		  if (navIcon) {
			navIcon?.removeEventListener('click', handleClick);
		  }
		};
	  }, []);
	

	return (
		<nav id='nav'>
			<button className='nav-icon' id='nav-icon'>
				<span></span>
			</button>
			<ul>
				<li>
				<Link to='/home' preventScrollReset={true} reloadDocument>
					{' '} Home {' '}
				</Link>
				</li>
				<li>
				<Link to='/about' preventScrollReset={true} reloadDocument>
					{' '} About {' '}
				</Link>
				</li>
				<li>
				<Link to='/for-artist'>
					{' '} For Artist {' '}
				</Link>
				</li>
				<li>
				<Link to='/for-clients'>
					{' '} For Startups {' '}
				</Link>
				</li>
				<li>
				<Link to='/works'>
					{' '} Our Work {' '}
				</Link>
				</li>
				<li>
				<Link to='/contact'>
					{' '} Contact {' '}
				</Link>
				</li>
				{/* <li>
					<a href="#growth">Growth</a>
				</li>
				<li>
					<a href="#end" >Ending</a>
				</li> */}
			</ul>
		</nav>
	)
}

export default SideNav
