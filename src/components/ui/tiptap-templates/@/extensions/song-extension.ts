import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SongNode } from '../components/tiptap-node/song-node/song-node'

export interface SongOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    song: {
      /**
       * Insert a song element
       */
      insertSong: (options: { 
        title: string
        artist: string
        id?: number
        coverArt?: string
        musicUrl?: string
      }) => ReturnType
    }
  }
}

export const Song = Node.create<SongOptions>({
  name: 'song',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'inline*',

  atom: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({
          'data-title': attributes.title
        })
      },
      artist: {
        default: '',
        parseHTML: element => element.getAttribute('data-artist'),
        renderHTML: attributes => ({
          'data-artist': attributes.artist
        })
      },
      id: {
        default: 0,
        parseHTML: element => parseInt(element.getAttribute('data-id') || '0'),
        renderHTML: attributes => ({
          'data-id': attributes.id
        })
      },
      coverArt: {
        default: '',
        parseHTML: element => element.getAttribute('data-cover-art'),
        renderHTML: attributes => ({
          'data-cover-art': attributes.coverArt
        })
      },
      musicUrl: {
        default: '',
        parseHTML: element => element.getAttribute('data-music-url'),
        renderHTML: attributes => ({
          'data-music-url': attributes.musicUrl
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="song"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'song',
      }),
      0,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SongNode)
  },

  addCommands() {
    return {
      insertSong:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
