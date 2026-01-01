import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface ImageResizeOptions {
  types: string[]
}

export const ImageResizeExtension = Extension.create<ImageResizeOptions>({
  name: 'imageResize',

  addOptions() {
    return {
      types: ['image'],
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []
            const { doc, selection } = state

            doc.descendants((node, pos) => {
              if (this.options.types.includes(node.type.name)) {
                if (selection.from <= pos && selection.to >= pos + node.nodeSize) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'image-resizable',
                    })
                  )
                }
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})