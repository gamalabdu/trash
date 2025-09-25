import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react'
import { useRosterData } from '../../hooks/useRosterData'
import { RosterArtist, SocialLink } from '../../utils/sanityClient'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import { FaInstagram, FaTwitter, FaSpotify, FaYoutube, FaSoundcloud, FaApple, FaTiktok, FaFacebook, FaLinkedin, FaGlobe, FaExternalLinkAlt } from 'react-icons/fa'

const Roster = () => {
  const { rosterData, loading, error } = useRosterData()
  const [selectedArtist, setSelectedArtist] = useState<RosterArtist | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = "TRASH - Roster"
  }, [])

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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const getSocialIcon = (type: string) => {
    const iconType = type.toLowerCase();
    switch (iconType) {
      case 'instagram':
        return <FaInstagram className="w-5 h-5" />;
      case 'twitter':
        return <FaTwitter className="w-5 h-5" />;
      case 'spotify':
        return <FaSpotify className="w-5 h-5" />;
      case 'youtube':
        return <FaYoutube className="w-5 h-5" />;
      case 'soundcloud':
        return <FaSoundcloud className="w-5 h-5" />;
      case 'apple music':
      case 'apple':
        return <FaApple className="w-5 h-5" />;
      case 'tiktok':
        return <FaTiktok className="w-5 h-5" />;
      case 'facebook':
        return <FaFacebook className="w-5 h-5" />;
      case 'linkedin':
        return <FaLinkedin className="w-5 h-5" />;
      case 'website':
      case 'web':
        return <FaGlobe className="w-5 h-5" />;
      default:
        return <FaExternalLinkAlt className="w-4 h-4" />;
    }
  };

  const handleSocialClick = (link: string) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener,noreferrer')
    } else {
      window.open(`https://${link}`, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <motion.div
        className="bg-[#1b1c1e] text-[#F0EEF0] w-full min-h-[100dvh] flex items-center justify-center"
        initial="hidden"
        animate="show"
        exit="exit"
        variants={fadeOut}
      >
        <LoadingSpinner />
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="bg-[#1b1c1e] text-[#F0EEF0] w-full min-h-[100dvh] flex items-center justify-center"
        initial="hidden"
        animate="show"
        exit="exit"
        variants={fadeOut}
      >
        <div className="text-center max-w-md px-8">
          <h2 className="text-2xl font-primary mb-4">Error Loading Roster</h2>
          <p className="text-[#cccccc] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#f93b3b] text-white font-secondary font-semibold uppercase tracking-wider hover:bg-[#e12d2d] transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-[#1b1c1e] text-[#F0EEF0] w-full min-h-[100dvh] overflow-visible"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden flex items-center justify-center w-full">
        <div className="absolute inset-0 bg-[#1b1c1e]"></div>
        
        <div className="relative z-10 text-center max-w-4xl px-8">
          <motion.h1 
            className="font-primary text-white mb-6 tracking-[0.05em] leading-[0.9]"
            style={{fontSize: 'clamp(3.5rem, 8vw, 7rem)'}}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            OUR ROSTER
          </motion.h1>
          <motion.p 
            className="font-secondary font-light text-white/80 tracking-[0.2em] uppercase"
            style={{fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Showcasing Our In-House Artists
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 max-w-7xl mx-auto">
        {rosterData.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-primary text-4xl text-[#7a7a7a] mb-4">Coming Soon</h2>
            <p className="font-secondary text-[#cccccc] text-lg">
              We're currently building our roster of exceptional artists
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {rosterData.map((artist, index) => (
              <motion.article
                key={artist.artistName}
                className="group relative bg-gradient-to-b from-[#2a2b2d] to-[#1b1c1e] overflow-hidden hover:shadow-2xl transition-all duration-500"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover={{ y: -8 }}
              >
                {/* Artist Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  {artist.artistImage ? (
                    <img
                      src={artist.artistImage}
                      alt={artist.artistName}
                      className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#3a3b3d] to-[#2a2b2d] flex items-center justify-center">
                      <span className="font-primary text-6xl text-[#7a7a7a]">
                        {artist.artistName.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Social Links Overlay */}
                  {artist.artistSocials && artist.artistSocials.length > 0 && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      {artist.artistSocials.slice(0, 4).map((social, socialIndex) => (
                        <button
                          key={socialIndex}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSocialClick(social.link)
                          }}
                          className="w-10 h-10 bg-black/70 hover:bg-[#f93b3b] text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-[#f93b3b]"
                          title={`${social.type} - ${artist.artistName}`}
                        >
                          {getSocialIcon(social.type)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="p-6">
                  <h3 className="font-primary text-2xl text-white mb-3 group-hover:text-[#f93b3b] transition-colors duration-300">
                    {artist.artistName}
                  </h3>
                  
                  <p className="font-secondary text-[#cccccc] text-sm leading-relaxed overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                    {artist.artistBio}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* Artist Detail Modal */}
      {selectedArtist && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedArtist(null)}
        >
          <motion.div
            className="bg-[#2a2b2d] max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {selectedArtist.artistImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={selectedArtist.artistImage}
                    alt={selectedArtist.artistName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors duration-300"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              <h2 className="font-primary text-4xl text-white mb-4">
                {selectedArtist.artistName}
              </h2>
              
              <p className="font-secondary text-[#cccccc] text-base leading-relaxed mb-6">
                {selectedArtist.artistBio}
              </p>

              {selectedArtist.artistSocials && selectedArtist.artistSocials.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {selectedArtist.artistSocials.map((social, socialIndex) => (
                    <button
                      key={socialIndex}
                      onClick={() => handleSocialClick(social.link)}
                      className="flex items-center gap-3 px-4 py-3 bg-[#f93b3b] text-white font-secondary font-semibold uppercase tracking-wider hover:bg-[#e12d2d] transition-colors duration-300"
                    >
                      {getSocialIcon(social.type)}
                      <span>{social.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Roster