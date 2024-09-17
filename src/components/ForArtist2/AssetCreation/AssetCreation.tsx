// import { createClient } from "@sanity/client";
// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import "./styles.css";
// import TextScramble from "@twistezo/react-text-scramble";
// import AssetCreationGallery from "./AssetCreationGallery";

// const AssetCreation = () => {


//   const imageList = [
//     {
//       src: "https://images.unsplash.com/photo-1604871000636-074fa5117945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
//       alt: "image 1",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
//       alt: "image 2",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1505178041309-ad46d2e4207b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
//       alt: "image 3",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1497114046243-1154db4f4abf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=948&q=80",
//       alt: "image 4",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1573655349936-de6bed86f839?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjN8fGFic3RyYWN0JTIwJTIweWVsbG93fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
//       alt: "image 5",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1541356665065-22676f35dd40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=327&q=80",
//       alt: "image 6",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YWJzdHJhY3QlMjAlMjBza3l8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
//       alt: "image 7",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1460411794035-42aac080490a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGFic3RyYWN0JTIwJTIwc2t5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
//       alt: "image 8",
//     },
//     {
//       src: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGFic3RyYWN0JTIwJTIwc2t5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
//       alt: "image 9",
//     },
//   ];

//   const scrambleTexts = ["visuals", "cover art", "content"];

//   const sanityClient = createClient({
//     projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
//     dataset: process.env.REACT_APP_SANITY_DATASET,
//     useCdn: true, // set to `false` to bypass the edge cache
//     apiVersion: "2024-01-14", // use current date (YYYY-MM-DD) to target the latest API version
//     token: process.env.REACT_APP_SANITY_TOKEN,
//     ignoreBrowserTokenWarning: true,
//   });

//   type Photo = {
//     title: string;
//     subtitle: string;
//     imageSrc: string;
//   };

//   type Video = {
//     title: string;
//     subtitle: string;
//     videoSrc: string;
//   };



//   const shuffleArray = (array: Photo[]) => {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   };


//   const shuffleArrayVideo = (array: Video[]) => {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   };



//   const [photos, setPhotos] = useState<Photo[]>([]);
//   const [video, setVideos] = useState<Video[]>([])

//   const getPhotos = async () => {
//     await sanityClient
//       .fetch(
//         `
//         *[_type == "assetCreationPhotos"]{
//         title,
//         subtitle,
//         assetImage{
//       asset->{
//         url
//       }
//     },
//       }
//       `
//       )
//       .then((assetPhotosData) => {

 
//         let assetPhotosTemp = assetPhotosData;

//         let assetPhotoEntries: Photo[] = assetPhotosTemp.map((photo: any) => ({
//           title: photo.title,
//           subtitle: photo.subtitle,
//           imageSrc: photo.assetImage.asset.url,
//         }));

//         assetPhotoEntries = shuffleArray(assetPhotoEntries);
//         setPhotos(assetPhotoEntries);

//       });
//   };




//   const getVideos = async () => {

//     await sanityClient
//       .fetch(
//         `
//         *[_type == "assetCreationVideos
//         subtitle,
//         assetVideo{
//       asset->{
//         url
//       }
//     },
//       }
//       `
//       )
//       .then((assetVideoData) => {

 
//         let assetVideoTemp = assetVideoData;

//         let assetVideoEntries: Video[] = assetVideoTemp.map((video: any) => ({
//           title: video.title,
//           subtitle: video.subtitle,
//           videoSrc: video.assetImage.asset.url,
//         }));

//         assetVideoEntries = shuffleArrayVideo(assetVideoEntries);

//         setVideos(assetVideoEntries);

//       });
//   };



//   useEffect(() => {
//     getPhotos();
//   }, []);

//   const fadeOut = {
//     hidden: {
//       opacity: 0,
//       y: 200,
//     },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         ease: "easeInOut",
//         duration: 1.6,
//       },
//     },
//     exit: {
//       opacity: 0,
//       y: -200,
//       transition: {
//         ease: "easeInOut",
//         duration: 1.6,
//       },
//     },
//   };

//   return (
//     <motion.div
//       className="branding-container"
//       initial="hidden"
//       animate="show"
//       exit="exit"
//       variants={fadeOut}
//     >
//       <div className="music-creation-top">
//         <div className="step1-text">
//           Let us help you make &nbsp;
//           <TextScramble
//             className="text-scramble"
//             texts={scrambleTexts}
//             letterSpeed={20}
//             nextLetterSpeed={50}
//             pauseTime={1500}
//           />
//           &nbsp; for your digital identity.
//         </div>
//       </div>


//       <section>

//         <h1> PHOTOGRAPHY </h1>

//         <AssetCreationGallery images={photos} />

//         <hr style={{ borderBottom: "2px solid white", width: "calc(100% - 40px)", margin: "0 20px" }} />

//       </section>


//     </motion.div>
//   );
// };

// export default AssetCreation;












import { createClient } from "@sanity/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./styles.css";
import TextScramble from "@twistezo/react-text-scramble";
import AssetCreationGallery from "./AssetCreationGallery";

const AssetCreation = () => {


  const sanityClient = createClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true,
    apiVersion: "2024-01-14",
    token: process.env.REACT_APP_SANITY_TOKEN,
    ignoreBrowserTokenWarning: true,
  });

  type Media = {
    title: string;
    subtitle: string;
    src: string;
    type: "photo" | "video";
  };

  const shuffleArray = (array: Media[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [media, setMedia] = useState<Media[]>([]);

  const getPhotos = async () => {

    const assetPhotosData = await sanityClient.fetch(`
      *[_type == "assetCreationPhotos"]{
        title,
        subtitle,
        assetImage{
          asset->{
            url
          }
        },
      }
    `);  

    const photoEntries: Media[] = assetPhotosData.map((photo: any) => ({
      title: photo.title,
      subtitle: photo.subtitle,
      src: photo.assetImage.asset.url,
      type: "photo",
    }));

    return photoEntries;
  };

  const getVideos = async () => {

    const assetVideoData = await sanityClient.fetch(`
      *[_type == "assetCreationVideos"]{
        title,
        subtitle,
        assetVideo{
          asset->{
            url
          }
        },
      }
    `);
  
    const videoEntries: Media[] = assetVideoData
      .filter((video: any) => video.assetVideo && video.assetVideo.asset && video.assetVideo.asset.url)
      .map((video: any) => ({
        title: video.title,
        subtitle: video.subtitle,
        src: video.assetVideo.asset.url,
        type: "video",
      }));
  
    return videoEntries;
  };
  

  useEffect(() => {
    const fetchData = async () => {
      const photos = await getPhotos();
      const videos = await getVideos();
      const combinedMedia = shuffleArray([...photos, ...videos]);
      setMedia(combinedMedia);
    };

    fetchData();
  }, []);

  const fadeOut = {
    hidden: {
      opacity: 0,
      y: 200,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeInOut",
        duration: 1.6,
      },
    },
    exit: {
      opacity: 0,
      y: -200,
      transition: {
        ease: "easeInOut",
        duration: 1.6,
      },
    },
  };




  return (
    <motion.div
      className="branding-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      <div className="music-creation-top">
        <div className="step1-text">
          Let us help you make &nbsp;
          <TextScramble
            className="text-scramble"
            texts={["visuals", "cover art", "content"]}
            letterSpeed={20}
            nextLetterSpeed={50}
            pauseTime={1500}
          />
          &nbsp; for your digital identity.
        </div>
      </div>

      <section>
        <h1>PHOTOGRAPHY & VIDEOS</h1>
        <AssetCreationGallery media={media} />
        {/* <hr style={{ borderBottom: "2px solid white", width: "calc(100% - 40px)", margin: "0 20px" }} /> */}
      </section>

    </motion.div>
  );
};

export default AssetCreation;
