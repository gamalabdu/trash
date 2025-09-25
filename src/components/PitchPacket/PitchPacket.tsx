import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePitchPacket } from '../../hooks/usePitchPacket';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './styles.css';


const PitchPacket = () => {
  // Custom hooks
  const { data, loading, error, refetch } = usePitchPacket();
  
  // Set document title
  useDocumentTitle('Pitch Packet');

  // Debug logging
  useEffect(() => {
    console.log('PitchPacket Debug:', { data, loading, error });
    if (data) {
      console.log('PDF URL:', data.pdfFile.asset.url);
    }
  }, [data, loading, error]);

  // Mobile viewport and performance optimizations
  useEffect(() => {
    // Set viewport for better mobile experience
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }

    // Prevent zoom on double tap for better UX
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);


  const handleDownload = async () => {
    if (!data?.pdfFile.asset.url) return;
    
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = data.pdfFile.asset.url;
      link.download = `${data.title}.pdf`;
      link.setAttribute('aria-label', `Download ${data.title} PDF`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // You could add a toast notification here
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <motion.div 
        className='h-full w-full flex items-center justify-center min-h-[80vh] px-4 bg-brand-bg'
        initial='hidden'
        animate='show'
        exit='exit'
        variants={fadeInUp}
      >
        <div className='flex flex-col items-center gap-4 text-center'>
          <LoadingSpinner size='large' />
          <p className='text-brand-text-secondary font-secondary text-sm sm:text-base'>Loading pitch packet...</p>
        </div>
      </motion.div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <motion.div 
        className='h-full w-full flex items-center justify-center min-h-[80vh] px-4 bg-brand-bg'
        initial='hidden'
        animate='show'
        exit='exit'
        variants={fadeInUp}
      >
        <div className='flex flex-col items-center gap-4 sm:gap-6 max-w-sm sm:max-w-md mx-auto p-4 sm:p-6 text-center'>
          <div className='w-12 h-12 sm:w-16 sm:h-16 bg-brand-red/10 rounded-full flex items-center justify-center'>
            <svg className='w-6 h-6 sm:w-8 sm:h-8 text-brand-red' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
            </svg>
          </div>
          <div>
            <h3 className='text-brand-text font-primary text-lg sm:text-xl mb-2'>Something went wrong</h3>
            <p className='text-brand-text-secondary font-secondary text-xs sm:text-sm mb-4 leading-relaxed'>{error}</p>
          </div>
          <button
            onClick={refetch}
            className='btn btn-primary font-secondary text-sm sm:text-base px-6 py-3 min-h-[44px] pitch-packet-retry-btn'
            aria-label='Retry loading pitch packet'
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  // Handle empty state
  if (!data) {
    return (
      <motion.div 
        className='h-full w-full flex items-center justify-center min-h-[80vh] px-4 bg-brand-bg'
        initial='hidden'
        animate='show'
        exit='exit'
        variants={fadeInUp}
      >
        <div className='text-center'>
          <p className='text-brand-text-secondary font-secondary text-sm sm:text-base'>No pitch packet available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className='h-full w-full bg-brand-bg min-h-screen pitch-packet-container'
      initial='hidden'
      animate='show'
      exit='exit'
      variants={fadeInUp}
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl'>
        {/* Header */}
        <motion.div 
          className='text-center mb-6 sm:mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className='font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-brand-text mb-2 sm:mb-3 leading-tight'>
            {data.title}
          </h1>
          <p className='font-secondary text-brand-text-secondary text-xs sm:text-sm md:text-base max-w-md mx-auto px-2'>View and download our pitch packet</p>
        </motion.div>

        {/* PDF Viewer */}
        <motion.div 
          className='bg-brand-surface rounded-lg sm:rounded-xl shadow-2xl overflow-hidden mb-6 sm:mb-8 mx-auto pitch-packet-pdf-viewer'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className='aspect-[3/4] sm:aspect-[4/5] md:aspect-[16/10] lg:aspect-[16/9] w-full relative pitch-packet-pdf-container'>
            <iframe
              src={`${data.pdfFile.asset.url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
              className='w-full h-full border-0'
              title={`${data.title} PDF Viewer`}
              aria-label={`PDF viewer for ${data.title}`}
              style={{ 
                maxWidth: '100%',
                backgroundColor: 'white',
                minHeight: '400px'
              }}
              onLoad={() => console.log('PDF iframe loaded successfully')}
              onError={() => console.error('PDF iframe failed to load')}
            />
            {/* Mobile PDF hint overlay */}
            <div className='absolute top-2 right-2 sm:hidden bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none pitch-packet-pdf-hint'>
              Tap to interact
            </div>
          </div>
        </motion.div>

        {/* Download Section */}
        <motion.div 
          className='text-center px-4'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <button
            onClick={handleDownload}
            className='btn btn-primary font-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] sm:min-h-[48px] active:scale-95 transition-transform duration-150 pitch-packet-download-btn'
            aria-label={`Download ${data.title} PDF file`}
          >
            <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z' />
            </svg>
            Download PDF
          </button>
          <p className='font-secondary text-brand-text-muted text-xs sm:text-sm mt-2 sm:mt-3 max-w-xs mx-auto leading-relaxed'>
            PDF will download to your device
          </p>
          
          {/* Mobile-specific instructions */}
          <div className='mt-4 sm:hidden'>
            <details className='bg-brand-surface/50 rounded-lg p-3 text-left'>
              <summary className='font-secondary text-brand-text-secondary text-xs cursor-pointer list-none'>
                <span className='flex items-center justify-center gap-2'>
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  Mobile viewing tips
                </span>
              </summary>
              <div className='mt-2 space-y-1 text-brand-text-muted text-xs'>
                <p>• Pinch to zoom in/out</p>
                <p>• Swipe to navigate pages</p>
                <p>• Tap download for offline viewing</p>
              </div>
            </details>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PitchPacket;