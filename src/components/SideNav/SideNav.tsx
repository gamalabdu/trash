// import React, { useEffect, useRef } from 'react';
// import './styles.css';
// import { Link } from 'react-router-dom';

// const SideNav = () => {

//   const navRef = useRef<HTMLDivElement | null>(null); // Specify the type of the ref

//   const navIconRef = useRef<HTMLButtonElement | null>(null);

//   useEffect(() => {

//     const toggleNav = () => {

//       const nav = navRef.current

//       if (nav?.classList.contains('active')) {
//         nav.classList.remove('active');
//       } else {
//         nav?.classList.add('active');
//       }
//     };

//     const navIcon = navIconRef.current

//     if (navIcon) {
//       navIcon.addEventListener('click', toggleNav);
//     }

//     return () => {
//       if (navIcon) {
//         navIcon.removeEventListener('click', toggleNav);
//       }
//     };
//   }, []);

//   return (
//     <nav id='nav' ref={navRef}>
//  			<button className='nav-icon' id='nav-icon' ref={navIconRef}>
//  				<span></span>
//  			</button>
//  			<ul>
//  				<li>
//  				<Link to='/home' preventScrollReset={true} reloadDocument>
//  					{' '} Home {' '}
//  				</Link>
//  				</li>
//  				<li>
//  				<Link to='/about' preventScrollReset={true} reloadDocument>
//  					{' '} About {' '}
//  				</Link>
//  				</li>
//  				<li>
//  				<Link to='/for-artist'>
//  					{' '} For Artist {' '}
//  				</Link>
//  				</li>
//  				<li>
//  				<Link to='/for-clients'>
//  					{' '} For Startups {' '}
//  				</Link>
//  				</li>
//  				<li>
//  				<Link to='/works'>
//  					{' '} Our Work {' '}
//  				</Link>
//  				</li>
//  				<li>
//  				<Link to='/contact'>
//  					{' '} Contact {' '}
//  				</Link>
//  				</li>
//  			</ul>
//  		</nav>
//   )
// }

// export default SideNav;

import React, { useState } from 'react'
import './styles.css'
import { Link, NavLink } from 'react-router-dom'

const SideNav = () => {
  
	const [isNavActive, setIsNavActive] = useState(false)

	const toggleNav = () => {
		setIsNavActive((prev) => !prev)
	}

	return (
		<nav id='nav' className={ isNavActive ? 'active' : ''}>

			<button className='nav-icon' id='nav-icon' onClick={toggleNav}>
				<span></span>
				
			</button>
			<ul>
				<li>
					{/* <Link to='/home' preventScrollReset={true} reloadDocument>
						Home
					</Link> */}
					<NavLink key={'/home'} style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/home'>
						Home
					</NavLink>
				</li>
				<li>
					<NavLink key={'/about'} style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/about'>
						About
					</NavLink>
				</li>
				<li>
					<NavLink key={'/for-artists'} style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/for-artists'>
						For Artist
					</NavLink>
				</li>
				<li>
					<NavLink key={'/for-clients'} style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/for-clients'>
						For Startups
					</NavLink>
				</li>
				<li>
					<NavLink key={'our-work'} style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/works'>
						Our Work
					</NavLink>
				</li>
				<li>
					<NavLink key={'/press'} style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/press'>
						Press
					</NavLink>
				</li>
				<li>
					<NavLink 
					key={'/contact'} 
					style={ ({isActive}) => { return isActive ? {color:"#f93b3b"} : {} }} to='/contact' 
					// preventScrollReset={true} 
					// reloadDocument
					>
						Contact
					</NavLink>
				</li>
				{/* <li>
          <a href="#growth">Growth</a>
        </li>
        <li>
          <a href="#end">Ending</a>
        </li> */}
			</ul>
		</nav>
	)
}

export default SideNav
