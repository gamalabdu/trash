// import { createClient } from '@sanity/client';
// import { motion } from 'framer-motion';
// import React, { useEffect, useState } from 'react'
// import './styles.css'
// import TextScramble from '@twistezo/react-text-scramble';

// const Outreach = () => {


//     const scrambleTexts = ["Feature", "Interview", "Review", "Write Up", "Editorial"];

//     const sanityClient = createClient({
//         projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
//         dataset: process.env.REACT_APP_SANITY_DATASET,
//         useCdn: true, // set to `false` to bypass the edge cache
//         apiVersion: "2024-01-14", // use current date (YYYY-MM-DD) to target the latest API version
//         token: process.env.REACT_APP_SANITY_TOKEN,
//         ignoreBrowserTokenWarning: true,
//       });
    
//       type Video = {
//         title: string,
//         video: string
//       }


//       const [ videos , setVideos ] = useState<Video[]>([])


//     const getBrandingVideos = async () => {

//         await sanityClient.fetch(`
//         *[_type == "brandingPage"]{
//         title,
//         videos[]{
//             asset->{
//               url
//             }
//         },
//         link
//       }
//       `)
//       .then((videoData) => {
    
//         let videoDataTemp = videoData;
  
//           let videoEntries: Video[] = videoDataTemp.map((video: any) => ({
//             title: video.title,
//             video: video.videos.map((v: any) => v.asset.url)
//           }));
    
//           setVideos(videoEntries);
    
//       })
    
//       }


//       useEffect(() => {

//         getBrandingVideos()
        
//       }, [])


//       const fadeOut = {
//         hidden: {
//           opacity: 0,
//           y: 200,
//         },
//         show: {
//           opacity: 1,
//           y: 0,
//           transition: {
//             ease: "easeInOut",
//             duration: 1.6,
//           },
//         },
//         exit: {
//           opacity: 0,
//           y: -200,
//           transition: {
//             ease: "easeInOut",
//             duration: 1.6,
//           },
//         },
//       };


//   return (
//     <motion.div
//     className="branding-container"
//     initial="hidden"
//     animate="show"
//     exit="exit"
//     variants={fadeOut}
//   >


// <div className="music-creation-top">
//         <div className="step1-text">
//           Let us get you a &nbsp;
//           <TextScramble
//             className="text-scramble"
//             texts={scrambleTexts}
//             letterSpeed={20}
//             nextLetterSpeed={50}
//             pauseTime={1500}
//           />
//           &nbsp;.
//         </div>
//       </div>


//         <div className='branding-videos-container'>

//             {
//                 videos.map((video, idx) => {
//                     return ( 
//                     <div key={idx} className='branding-video-container'>
//                         <video width="500"  src={ video.video } draggable={false} controls={true} autoPlay={false} loop={true} />
//                     </div>
//                 )
//                 })
//             }


//         </div>
    


    
//   </motion.div>
//   )
// }

// export default Outreach















import "./styles.css"

const Outreach = () => {
  return (
    <div className="outreach-container">
      <h1 className="outreach-title">Our Premium Services</h1>

      <section className="service-category">
        <h2 className="service-title">Asset Creation</h2>
        <p className="category-description">
          Our Asset Creation services bring your artistic vision to life with unparalleled craftsmanship. From stunning photography to visually arresting artwork design, our team delivers assets that resonate with luxury and creativity.
        </p>
        <div className="media-container">
          <img
            src="https://images.unsplash.com/photo-1604871000636-074fa5117945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            alt="Photography Example"
            className="service-media"
          />
          <video
            src="https://example.com/video.mp4"
            controls
            className="service-media"
          />
        </div>
        <ul className="service-list">
          <li>Photography</li>
          <li>Artwork Design</li>
          <li>Videography</li>
          <li>Social Media Content</li>
          <li>Ads</li>
        </ul>
      </section>

      <section className="service-category">
        <h2 className="service-title">Digital</h2>
        <p className="category-description">
          Elevate your digital presence with our bespoke website design, cutting-edge data analytics, seamless distribution channels, and strategic sync licensing opportunities.
        </p>
        <div className="media-container">
          <img
            src="https://images.unsplash.com/photo-1534126511673-b6899657816a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            alt="Website Design Example"
            className="service-media"
          />
          <video
            src="https://example.com/video2.mp4"
            controls
            className="service-media"
          />
        </div>
        <ul className="service-list">
          <li>Websites</li>
          <li>Data</li>
          <li>Distribution</li>
          <li>Sync Licensing</li>
        </ul>
      </section>

      <section className="service-category">
        <h2 className="service-title">Outreach</h2>
        <p className="category-description">
          Gain unparalleled exposure with our expertly curated outreach services. We connect you with top editorial platforms, arrange exclusive interviews, secure reviews in prestigious outlets, and manage features and premieres that put you in the spotlight.
        </p>
        <div className="media-container">
          <img
            src="https://images.unsplash.com/photo-1521101840183-fc7b23de4e70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            alt="Editorial Example"
            className="service-media"
          />
          <video
            src="https://example.com/video3.mp4"
            controls
            className="service-media"
          />
        </div>
        <ul className="service-list">
          <li>Editorial Pitching</li>
          <li>Interviews</li>
          <li>Reviews</li>
          <li>Features</li>
          <li>Premieres</li>
        </ul>
      </section>
    </div>
  );
};

export default Outreach;
