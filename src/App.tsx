
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
import ForArtists from './components/ForArtist2/ForArtistHomePage/ForArtistHomePage';
import MusicCreation from './components/ForArtist2/MusicCreation/MusicCreation';
import AssetCreation from './components/ForArtist2/AssetCreation/AssetCreation';
import Outreach from './components/ForArtist2/Outreach/Outreach';
import Digital from './components/ForArtist2/Digital/Digital';
import ArtistDevelopment from './components/ForArtist2/ArtistDevelopment/ArtistDevelopment';
import BrandingPage from './components/ForArtist2/BrandingPage/BrandingPage';
import PitchPacket from './components/PitchPacket/PitchPacket';
import Roster from './components/Roster/Roster';
import NotFound from './components/NotFound/NotFound';
import { WorksProvider } from './context/WorksContext';



function App() {


  const location = useLocation()


  return (
    <WorksProvider>
      <div className="App">

        <AnimatePresence initial={false} mode='wait'>
          <Routes location={location} key={location.pathname}>

            <Route index element={<Enter />} />

            <Route
              element={<NavContainer />}
            >
              <Route path="home" element={<Home />} />
              <Route path="about" element={<About />} />

              <Route path="for-artists" element={<ForArtists />} />
              <Route path="for-artists/music_creation" element={<MusicCreation />} />
              <Route path="for-artists/asset_creation" element={<AssetCreation />} />
              <Route path="for-artists/branding" element={<BrandingPage />} />
              <Route path="for-artists/outreach" element={<Outreach />} />
              <Route path="for-artists/digital" element={<Digital />} />
              <Route path="for-artists/artist_development" element={<ArtistDevelopment />} />

              {/* <Route path="for-clients" element={<ForClients />} /> */}

              <Route path="works" element={<Works/>} />
              <Route path="works/:slug" element={<InnerWork />} />
              <Route path='press' element={<Press />} />
              <Route path="contact" element={<Contact />} />
              <Route path="roster" element={<Roster />} />
              <Route path="/gamal-portfolio" element={<Portfolio />} />
              <Route path="/pitch-packet" element={<PitchPacket />} />
              
              {/* Catch-all route for 404 page */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>

          {/* <Footer/> */}
        </AnimatePresence>
      </div>
    </WorksProvider>
  );
}

export default App;
