
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import Enter from './components/Enter/Enter';
import NavContainer from './components/NavContainer/NavContainer';
import Home from './components/Home/Home';
import About from './components/About/About';
import ForArtist from './components/ForArtist/ForArtist';
import ForClients from './components/ForClients/ForClients';
import Works from './components/Works/Works';
import Contact from './components/Contact/Contact';
import InnerWork from './components/InnerWork/InnerWork';
import Press from './components/Press/Press';
import { AnimatePresence } from 'framer-motion';
import Portfolio from './components/Portfoliio/Portfolio';



function App() {


  const location = useLocation();


  return (

    <div className="App">

      <AnimatePresence initial={true} mode='wait'>
        
        <Routes location={location} key={location.pathname}>

          {/* Set the default route to "Enter" */}
          <Route index element={<Enter />} />

          <Route
            element={<NavContainer />}
          >
            <Route path="home" element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="for-artists" element={<ForArtist />} />
            <Route path="for-clients" element={<ForClients />} />
            <Route path="works" element={<Works/>} />
            <Route path='innerworks' element={<InnerWork />} />
            <Route path='press' element={<Press />} />
            <Route path="contact" element={<Contact />} />
            <Route path="/gamal-portfolio" element={<Portfolio />} />
          </Route>
        </Routes>

        {/* <Footer/> */}
      </AnimatePresence>
    </div>
  );
}

export default App;
