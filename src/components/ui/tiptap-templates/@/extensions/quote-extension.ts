'use client';

import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { QuoteNode } from '../components/tiptap-node/quote-node/quote-node';

export interface QuoteOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    quote: {
      /**
       * Insert a pullquote
       */
      insertQuote: (options: { text?: string; author?: string }) => ReturnType;
    };
  }
}

export const Quote = Node.create<QuoteOptions>({
  name: 'quote',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: '',

  atom: true,

  draggable: true,

  addNodeView() {
    return ReactNodeViewRenderer(QuoteNode);
  },

  addAttributes() {
    return {
      text: {
        default: '',
        parseHTML: element => element.getAttribute('data-text') || '',
        renderHTML: attributes => ({
          'data-text': attributes.text
        })
      },
      author: {
        default: '',
        parseHTML: element => element.getAttribute('data-author') || '',
        renderHTML: attributes => ({
          'data-author': attributes.author
        })
      },
      width: {
        default: 'full',
        parseHTML: element => element.getAttribute('data-width') || 'full',
        renderHTML: attributes => ({
          'data-width': attributes.width
        })
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quote"]',
        getAttrs: (element) => {
          const text = element.getAttribute('data-text') || '';
          const author = element.getAttribute('data-author') || '';
          const width = element.getAttribute('data-width') || 'full';
          
          // Try to extract text and author from the HTML structure if data attributes are missing
          const textElement = element.querySelector('.quote-text');
          const authorElement = element.querySelector('.quote-author');
          
          return {
            text: text || (textElement ? textElement.textContent || '' : ''),
            author: author || (authorElement ? authorElement.textContent?.replace(/^—\s*/, '') || '' : ''),
            width: width,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { text, author, width } = node.attrs;
    
    return [
      'div',
      {
        ...HTMLAttributes,
        'data-type': 'quote',
        'data-text': text,
        'data-author': author,
        'data-width': width,
        class: `quote-wrapper quote-width-${width}`,
      },
      [
        'div',
        { class: 'quote-display' },
        [
          'div',
          { class: 'quote-content' },
          [
            'p',
            { class: 'quote-text' },
            text || '',
          ],
          ...(author ? [
            [
              'p',
              { class: 'quote-author' },
              `— ${author}`,
            ]
          ] : []),
        ],
      ],
    ];
  },

  addCommands() {
    return {
      insertQuote:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              text: options.text || '',
              author: options.author || ''
            },
          });
        },
    };
  },
});

