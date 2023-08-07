// import React, { useEffect, useState } from 'react';
// import { Link, Outlet } from 'react-router-dom';
// import SideNav from '../SideNav/SideNav';
// import Footer from '../Footer/Footer';
// import { FiArrowDown } from 'react-icons/fi';
// import { IoChatboxOutline } from 'react-icons/io5';
// import './styles.css';

// const NavContainer = () => {

//   const [isVisible, setIsVisible] = useState(false);

//   const scrollToBottom = () => {

//     const scrollHeight = document.documentElement.scrollHeight || 0;

//     if (scrollHeight > 0) {
//       window.scrollTo({
//         top: scrollHeight,
//         behavior: 'smooth',
//       });
//     }
//   }


//   useEffect(() => {
//     const toggleVisibility = () => {
//       const scrollHeight = document.documentElement.scrollHeight || 0;
//       const pageYOffset = window.pageYOffset || 0;
//       const innerHeight = window.innerHeight || 0;

//       setIsVisible(pageYOffset > 50 && !(pageYOffset + 50 >= scrollHeight + 10 - innerHeight + 10));
//     };

//     window.addEventListener('scroll', toggleVisibility);

//     return () => {
//       window.removeEventListener('scroll', toggleVisibility);
//     };
//   }, []);

//   return (
//     <div>
//       <SideNav />
//       <Outlet />
//       <div className={`scroll-to-top ${isVisible ? '' : 'scroll-to-top-active'}`}>
//         <FiArrowDown size={20} onClick={scrollToBottom} id='scrollToTopBtn' />
//         <Link to='/contact' style={{ textDecoration: 'none' }}>
//           <IoChatboxOutline size={20} />
//         </Link>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default NavContainer;









// import React, { useEffect, useState } from 'react'
// import { Link, Outlet } from 'react-router-dom'
// import SideNav from '../SideNav/SideNav'
// import Footer from '../Footer/Footer'
// import { FiArrowDown } from 'react-icons/fi'
// import { IoChatboxOutline } from 'react-icons/io5'
// import './styles.css'



// const NavContainer = () => {

// 	const [isVisible, setIsVisible] = useState(false)

// 	// Top: 0 takes us all the way back to the top of the page
// 	// Behavior: smooth keeps it smooth!

// 	const scrollToBottom = () => {
// 		const scrollHeight = document.documentElement?.scrollHeight || 0;
	
// 		if (scrollHeight > 0) {
// 			window.scrollTo({
// 				top: scrollHeight,
// 				behavior: 'smooth',
// 			});
// 		}
// 	};



// 	useEffect(() => {
// 		const toggleVisibility = () => {
// 			const scrollHeight = document?.documentElement?.scrollHeight || 0;
// 			const pageYOffset = window?.pageYOffset || 0;
// 			const innerHeight = window?.innerHeight || 0;
			
// 			if (pageYOffset > 50 && !(pageYOffset + 50 >= scrollHeight + 10 - innerHeight + 10)) {
// 				setIsVisible(true);
// 			} else {
// 				setIsVisible(false);
// 			}
// 		};
	
// 		window?.addEventListener('scroll', toggleVisibility);
	
// 		return () => {
// 			window?.removeEventListener('scroll', toggleVisibility);
// 		};
// 	}, []);
	

// 	return (
// 		<div>
// 			<SideNav />
// 			<Outlet />
// 				<div className={ isVisible ? 'scroll-to-top' : 'scroll-to-top-active'}>
// 					<FiArrowDown size={20} 
// 					onClick={() => scrollToBottom() } 
// 					id='scrollToTopBtn' />
// 					<Link to='/contact' style={{textDecoration:"none"}}>
// 					  <IoChatboxOutline size={20} />
// 				    </Link>
// 				</div>
// 			<Footer />
// 		</div>
// 	)
// }

// export default NavContainer













import React, { useEffect, useState, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import SideNav from '../SideNav/SideNav';
import Footer from '../Footer/Footer';
import { FiArrowDown } from 'react-icons/fi';
import { IoChatboxOutline } from 'react-icons/io5';
import './styles.css';

const NavContainer = () => {

  const [isVisible, setIsVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {

    const scrollContainer = scrollContainerRef.current;

    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollHeight = scrollContainer.scrollHeight || 0;
    const scrollTop = scrollContainer.scrollTop || 0;
    const clientHeight = scrollContainer.clientHeight || 0;

    setIsVisible(scrollTop > clientHeight * 0.5); // Adjust the threshold as needed
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div>
      <SideNav />
      <div
        ref={scrollContainerRef}
        className="scroll-container"
        onScroll={handleScroll} // Handle scroll directly on the div
      >
        <Outlet />
      </div>
      <div className={ isVisible ? 'scroll-to-top' : 'scroll-to-top-active'}>
        <FiArrowDown size={20} onClick={scrollToBottom} id="scrollToTopBtn" />
        <Link to="/contact" style={{ textDecoration: 'none' }}>
          <IoChatboxOutline size={20} />
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default NavContainer;
