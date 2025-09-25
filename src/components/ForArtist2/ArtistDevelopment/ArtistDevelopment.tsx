import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import TextScramble from "@twistezo/react-text-scramble";
import { 
  FaUserTie, 
  FaChartLine, 
  FaHandshake, 
  FaMicrophone, 
  FaInstagram, 
  FaMusic,
  FaVideo 
} from 'react-icons/fa';
import './styles.css';

const ArtistDevelopment = () => {

  const title = "Artist Development";

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `TRASH - ${title}`;
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

  const scrambleTexts = ["develop", "elevate", "transform", "launch"];

  const services = [
    {
      title: "Music Production",
      description: "Professional recording, mixing, and mastering services to bring your creative vision to life with industry-standard quality.",
      icon: FaMusic
    },
    {
      title: "Content Creation",
      description: "Comprehensive visual and multimedia content including music videos, promotional materials, and social media assets.",
      icon: FaVideo
    },
    {
      title: "Brand Identity",
      description: "Craft a unique artistic persona that resonates with your target audience and sets you apart in the industry.",
      icon: FaUserTie
    },
    {
      title: "Strategic Planning",
      description: "Develop comprehensive career roadmaps with clear milestones, timelines, and achievable goals.",
      icon: FaChartLine
    },
    {
      title: "Industry Connections",
      description: "Leverage our network of labels, producers, and industry professionals to open doors for your career.",
      icon: FaHandshake
    },
    {
      title: "Performance Coaching",
      description: "Enhance your stage presence, vocal delivery, and audience engagement for unforgettable live performances.",
      icon: FaMicrophone
    },
    {
      title: "Social Media Strategy",
      description: "Build and maintain a strong digital presence that converts followers into dedicated fans.",
      icon: FaInstagram
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Deep Dive",
      description: "We dig into your sound, story, and what makes you unique. No cookie-cutter plans here—just real talk about where you're at and where you want to go."
    },
    {
      step: "02", 
      title: "Blueprint",
      description: "Time to map out your takeover. We craft a game plan that's 100% you—authentic to your vision and built for the long haul."
    },
    {
      step: "03",
      title: "Launch Mode",
      description: "Now we make it happen. From laying down tracks to creating killer content, we're in the trenches with you every step of the way."
    },
    {
      step: "04",
      title: "Level Up",
      description: "Watch your fanbase grow and your streams climb. We keep pushing boundaries and evolving your artistry as you rise through the ranks."
    }
  ];

  return (
    <motion.div
      className="artist-development-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      {/* Hero Section */}
      <div className="artist-development-hero">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="hero-title">Artist Development</h1>
          <div className="hero-subtitle">
            Let us help you&nbsp;
            <TextScramble
              className="text-scramble"
              texts={scrambleTexts}
              letterSpeed={20}
              nextLetterSpeed={50}
              pauseTime={1500}
            />
            &nbsp;your artistic career.
          </div>
          <div className="hero-description">
            From emerging talent to established artists, we provide comprehensive development services 
            that elevate your career and amplify your creative vision.
          </div>
        </motion.div>
      </div>

      {/* Services Section */}
      <section className="services-section">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="section-title">What We Offer</h2>
          <p className="section-subtitle">Comprehensive development across all aspects of your career</p>
        </motion.div>
        
        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div 
              key={service.title}
              className="service-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <div className="service-icon">
                <service.icon />
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="section-title">Our Process</h2>
          <p className="section-subtitle">A proven methodology for artist success</p>
        </motion.div>
        
        <div className="process-timeline">
          {processSteps.map((step, index) => (
            <motion.div 
              key={step.step}
              className="process-step"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 + index * 0.2 }}
            >
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <h2 className="cta-title">Ready to Transform Your Career?</h2>
          <p className="cta-description">
            Skip the boring stuff—let’s get started.
          </p>
          <div className="cta-stats">
            <div className="stat">
              <span className="stat-number">30+</span>
              <span className="stat-label">Artists Developed</span>
            </div>
            <div className="stat">
              <span className="stat-number">50M+</span>
              <span className="stat-label">Streams Generated</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Industry Partnerships</span>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default ArtistDevelopment;