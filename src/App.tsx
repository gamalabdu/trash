
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Enter from './components/Enter/Enter';
import NavContainer from './components/NavContainer/NavContainer';
import Home from './components/Home/Home';
import About from './components/About/About';
import Works from './components/Works/Works';
import Contact from './components/Contact/Contact';
import InnerWork from './components/InnerWork/InnerWork';
import Press from './components/Press/Press';
import { AnimatePresence } from 'framer-motion';
import Portfolio from './components/Portfoliio/Portfolio';
import ForArtist2 from './components/ForArtist2/ForArtist2';
import MusicCreation from './components/ForArtist2/MusicCreation/MusicCreation';
import ForArtistHomePage from './components/ForArtist2/ForArtistHomePage/ForArtistHomePage';
import AssetCreation from './components/ForArtist2/AssetCreation/AssetCreation';
import Outreach from './components/ForArtist2/Outreach/Outreach';
import Digital from './components/ForArtist2/Digital/Digital';
import ArtistDevelopment from './components/ForArtist2/ArtistDevelopment/ArtistDevelopment';
import PitchPacket from './components/PitchPacket/PitchPacket';



function App() {


  const location = useLocation()


  return (

    <div className="App">

      <AnimatePresence initial={true} mode='wait'>
        
        <Routes location={location} key={location.pathname}>

          <Route index element={<Enter />} />

          <Route
            element={<NavContainer />}
          >
            <Route path="home" element={<Home />} />
            <Route path="about" element={<About />} />

            <Route path="for-artists" element={<ForArtist2 />} >

              <Route index element={ <ForArtistHomePage /> } />
              <Route path="music_creation" element={ <MusicCreation /> } />
              <Route path="asset_creation" element={ <AssetCreation /> } />
              <Route path="outreach" element={ <Outreach /> } />
              <Route path="digital" element={ <Digital /> } />
              <Route path="artist_development" element={ <ArtistDevelopment /> } />
          
            </Route>

            {/* <Route path="for-clients" element={<ForClients />} /> */}

            <Route path="works" element={<Works/>} />
            <Route path='innerworks' element={<InnerWork />} />
            <Route path='press' element={<Press />} />
            <Route path="contact" element={<Contact />} />
            <Route path="/gamal-portfolio" element={<Portfolio />} />
            <Route path="/pitch-packet" element={<PitchPacket />} />
          </Route>
        </Routes>

        {/* <Footer/> */}
      </AnimatePresence>
    </div>
  );
}

export default App;
