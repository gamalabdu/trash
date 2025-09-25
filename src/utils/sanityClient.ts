import { createClient } from '@sanity/client'

// Centralized Sanity client configuration
export const sanityClient = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
  dataset: process.env.REACT_APP_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2024-01-14',
  token: process.env.REACT_APP_SANITY_TOKEN,
  ignoreBrowserTokenWarning: true
})

// Type definitions for better type safety
export interface SanityImageAsset {
  asset: {
    url: string
  }
}

export interface HomeData {
  title: string
  homePic1: string
  homePic2: string
  icon: string
}

export interface SocialLink {
  link: string
  type: string
}

export interface RosterArtist {
  artistName: string
  artistSocials: SocialLink[]
  artistBio: string
  artistImage: string
}

// Centralized data fetching functions
export const fetchHomeData = async (): Promise<HomeData> => {
  const data = await sanityClient.fetch(`
    *[_type == "home"]{
      name,
      homePic1{
        asset -> {
          url
        }
      },
      homePic2{
        asset -> {
          url
        }
      },
      titleIcon{
        asset -> {
          url
        }
      },
    }
  `)

  const responseData = data[0]
  
  return {
    title: responseData.name,
    homePic1: responseData.homePic1.asset.url,
    homePic2: responseData.homePic2.asset.url,
    icon: responseData.titleIcon.asset.url
  }
}

export const fetchRosterData = async (): Promise<RosterArtist[]> => {
  const data = await sanityClient.fetch(`
    *[_type == "roster"]{
      artistName,
      artistSocials[]{
        link,
        type
      },
      artistBio,
      artistImage{
        asset -> {
          url
        }
      }
    }
  `)

  return data.map((artist: any) => ({
    artistName: artist.artistName,
    artistSocials: artist.artistSocials || [],
    artistBio: artist.artistBio,
    artistImage: artist.artistImage?.asset?.url || ''
  }))
}
