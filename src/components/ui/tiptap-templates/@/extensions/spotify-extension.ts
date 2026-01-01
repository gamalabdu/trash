import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SpotifyNode } from '../components/tiptap-node/spotify-node/spotify-node'

export interface SpotifyOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    spotify: {
      /**
       * Insert a Spotify embed element
       */
      insertSpotify: (options: { 
        url: string
        title?: string
        iframeCode?: string
      }) => ReturnType
    }
  }
}

export const Spotify = Node.create<SpotifyOptions>({
  name: 'spotify',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: '',

  atom: true,

  addAttributes() {
    return {
      url: {
        default: '',
        parseHTML: element => element.getAttribute('data-url'),
        renderHTML: attributes => ({
          'data-url': attributes.url
        })
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({
          'data-title': attributes.title
        })
      },
      iframeCode: {
        default: '',
        parseHTML: element => {
          // Look for iframe in the element's content
          const iframe = element.querySelector('iframe')
          if (iframe) {
            return iframe.outerHTML
          }
          
          // Fallback: try to get from data attribute (for backwards compatibility)
          const dataAttr = element.getAttribute('data-iframe-code')
          if (dataAttr) return dataAttr
          
          return ''
        },
        renderHTML: () => {
          // Don't render as data attribute since we're storing it as HTML content
          return {}
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="spotify"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = node.attrs as { url: string; title: string; iframeCode: string }
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'spotify',
        'data-url': attrs.url,
        'data-title': attrs.title,
        'data-iframe-code': attrs.iframeCode, // Store iframe code as data attribute for parsing
      }),
      // Don't store iframe code as text content to avoid HTML escaping
      // We'll extract it from the data attribute in the preview
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpotifyNode)
  },

  addCommands() {
    return {
      insertSpotify:
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
