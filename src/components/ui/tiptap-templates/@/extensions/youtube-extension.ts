import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { YouTubeNode } from '../components/tiptap-node/youtube-node/youtube-node'

export interface YouTubeOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtube: {
      /**
       * Insert a YouTube embed element
       */
      insertYouTube: (options: { 
        url: string
        title?: string
        videoId?: string
        embedCode?: string
      }) => ReturnType
    }
  }
}

export const YouTube = Node.create<YouTubeOptions>({
  name: 'youtube',

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
      videoId: {
        default: '',
        parseHTML: element => element.getAttribute('data-video-id'),
        renderHTML: attributes => ({
          'data-video-id': attributes.videoId
        })
      },
      embedCode: {
        default: '',
        parseHTML: element => {
          // Look for iframe in the element's content
          const iframe = element.querySelector('iframe')
          if (iframe) {
            return iframe.outerHTML
          }
          
          // Fallback: try to get from data attribute (for backwards compatibility)
          const dataAttr = element.getAttribute('data-embed-code')
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
        tag: 'div[data-type="youtube"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = node.attrs as { url: string; title: string; videoId: string; embedCode: string }
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'youtube',
        'data-url': attrs.url,
        'data-title': attrs.title,
        'data-video-id': attrs.videoId,
        'data-embed-code': attrs.embedCode, // Store embed code as data attribute for parsing
      }),
      // Don't store embed code as text content to avoid HTML escaping
      // We'll extract it from the data attribute in the preview
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeNode)
  },

  addCommands() {
    return {
      insertYouTube:
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
