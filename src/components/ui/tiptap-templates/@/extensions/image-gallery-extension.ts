import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ImageGalleryNode } from '../components/tiptap-node/image-gallery-node/image-gallery-node'

export interface ImageGalleryOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGallery: {
      /**
       * Insert an image gallery
       */
      insertImageGallery: (options: { images: string[] }) => ReturnType
    }
  }
}

export const ImageGallery = Node.create<ImageGalleryOptions>({
  name: 'imageGallery',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'inline*',

  atom: false,

  draggable: false,

  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryNode)
  },

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: element => {
          const images = element.querySelectorAll('img')
          return Array.from(images).map(img => img.getAttribute('src'))
        },
        renderHTML: attributes => {
          if (!attributes.images || attributes.images.length === 0) {
            return {}
          }
          return {
            'data-images': JSON.stringify(attributes.images)
          }
        },
      },
      layout: {
        default: 'horizontal',
        parseHTML: element => element.getAttribute('data-layout') || 'horizontal',
        renderHTML: attributes => ({
          'data-layout': attributes.layout
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      insertImageGallery:
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
