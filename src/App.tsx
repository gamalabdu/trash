import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Enter from './components/Enter/Enter';
import NavContainer from './components/NavContainer/NavContainer';
import Home from './components/Home/Home';
import About from './components/About/About';
import ForArtist from './components/ForArtist/ForArtist';
import ForClients from './components/ForClients/ForClients';
import Works from './components/Works/Works';
import Contact from './components/Contact/Contact';
import InnerWork from './components/InnerWork/InnerWork';

function App() {

  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>

             <Route path="/" element={<Enter />} />

             <Route path="home" element={ <Home /> } />

              {/* <Route element={ <NavContainer /> }>

                  <Route path="home" element={ <Home /> } />
                  <Route path="about" element={ <About /> } />
                  <Route path="for-artist" element={ <ForArtist /> } />
                  <Route path="for-clients" element={ <ForClients /> } />
                  <Route path="works" element={ <Works /> } />
                  <Route path='innerworks' element={ <InnerWork /> } />
                  <Route path="contact" element={ <Contact /> } />

              </Route> */}


        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

