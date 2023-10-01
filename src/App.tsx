import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import Footer from './components/Footer/Footer';

function App() {

  const location = useLocation();
  
  return (
    <div className="App">

      <AnimatePresence initial={true} mode='wait'>

        <Routes location={location} key={location.pathname}>

             <Route path="/" element={<Enter />} />

             <Route element={ <NavContainer /> }>

                <Route index element={<Home/>} />
                <Route path="home" element={ <Home /> } />
                <Route path="about" element={ <About /> } />
                <Route path="for-artist" element={ <ForArtist /> } />
                <Route path="for-clients" element={ <ForClients /> } />
                <Route path="works" element={ <Works /> } />
                <Route path='innerworks' element={ <InnerWork /> } />
                <Route path='press' element={ <Press /> } />
                <Route path="contact" element={ <Contact /> } />

              </Route>

        </Routes>

        {/* <Footer/> */}

      </AnimatePresence>

    </div>
  );
}

export default App;

