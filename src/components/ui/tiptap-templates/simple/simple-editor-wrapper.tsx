"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from '../@/extensions/image-extension';
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import Button from "../@/components/tiptap-ui-primitive/button/button"
import { Spacer } from "../@/components/tiptap-ui-primitive/spacer/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../@/components/tiptap-ui-primitive/toolbar/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "../@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "../@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
// import { ImageGallery } from "../@/extensions/image-gallery-extension" // Removed - using side-by-side images instead
import { Song } from "../@/extensions/song-extension"
import { Quote } from "../@/extensions/quote-extension"
import { Spotify } from "../@/extensions/spotify-extension"
import { YouTube } from "../@/extensions/youtube-extension"
import { DragHandle } from '@tiptap/extension-drag-handle'
import "../@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "../@/components/tiptap-node/code-block-node/code-block-node.scss"
import "../@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "../@/components/tiptap-node/quote-node/quote-node.scss"
import "../@/components/tiptap-node/list-node/list-node.scss"
import "../@/components/tiptap-node/image-node/image-node.scss"
import "../@/components/tiptap-node/image-gallery-node/image-gallery-node.scss"
import "../@/components/tiptap-node/song-node/song-node.scss"
import "../@/components/tiptap-node/spotify-node/spotify-node.scss"
import "../@/components/tiptap-node/youtube-node/youtube-node.scss"
import "../@/components/tiptap-node/heading-node/heading-node.scss"
import "../@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "../@/components/tiptap-ui/heading-dropdown-menu/heading-dropdown-menu"
import { ImageUploadButton } from "../@/components/tiptap-ui/image-upload-button/image-upload-button"
// import { ImageGalleryButton } from "../@/components/tiptap-ui/image-gallery-button/image-gallery-button" // Removed - using side-by-side images instead
import { QuoteButton } from "../@/components/tiptap-ui/quote-button/quote-button"
import { SpotifyButton } from "../@/components/tiptap-ui/spotify-button/spotify-button"
import { YouTubeButton } from "../@/components/tiptap-ui/youtube-button/youtube-button"
import { ListDropdownMenu } from "../@/components/tiptap-ui/list-dropdown-menu/list-dropdown-menu"
import { BlockquoteButton } from "../@/components/tiptap-ui/blockquote-button/blockquote-button"
import { CodeBlockButton } from "../@/components/tiptap-ui/code-block-button/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "../@/components/tiptap-ui/color-highlight-popover/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "../@/components/tiptap-ui/link-popover/link-popover"
import { MarkButton } from "../@/components/tiptap-ui/mark-button/mark-button"
import { TextAlignButton } from "../@/components/tiptap-ui/text-align-button/text-align-button"
import { UndoRedoButton } from "../@/components/tiptap-ui/undo-redo-button/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "../@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "../@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "../@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsMobile } from "../@/hooks/use-mobile"
import { useWindowSize } from "../@/hooks/use-window-size"
import { useCursorVisibility } from "../@/hooks/use-cursor-visibility"

// --- Components ---
import { ThemeToggle } from "./theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "../@/lib/tiptap-utils"
import { ImageResizeExtension } from "../@/extensions/image-resize-extension"

// --- Styles ---
import "./simple-editor.scss"

type Props = {
  value: string;                               // HTML value
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string>; // returns a URL to insert
};

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onUploadImage,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  onUploadImage?: (file: File) => Promise<string>
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
        {/* <ImageGalleryButton onUploadImage={onUploadImage} /> */} {/* Removed - using side-by-side images instead */}
        <QuoteButton />
        <SpotifyButton />
        <YouTubeButton />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button type="button" data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditorWrapper({ value, onChange, onUploadImage }: Props) {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const lastEditorContent = React.useRef<string>(value || '<p></p>')
  const isUpdatingFromEditor = React.useRef(false)

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleDrop: (view, event, slice, moved) => {
        console.log('Drop event triggered', { moved, event }) // Debug log
        
        // Handle custom drag and drop for galleries and images
        const data = event.dataTransfer?.getData('text/plain')
        if (data) {
          try {
            const dragData = JSON.parse(data)
            console.log('Drop data:', dragData) // Debug log
            
            if (dragData.type === 'image' || dragData.type === 'quote') { // Support image and quote dragging
              console.log('Processing drag data:', dragData) // Debug log
              
              // Prevent default drop behavior
              event.preventDefault()
              event.stopPropagation()
              
              // Get the drop position
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
              console.log('Drop position:', pos) // Debug log
              
              if (pos !== null) {
                // Calculate the correct positions
                const originalPos = dragData.pos
                const dropPos = pos.pos
                
                console.log('Original pos:', originalPos, 'Drop pos:', dropPos) // Debug log
                console.log('Node type:', dragData.type) // Debug log
                
                if (dropPos !== originalPos) {
                  // Create a transaction to move the node
                  let tr = view.state.tr
                  
                  // Delete the original node first
                  tr = tr.delete(originalPos, originalPos + 1)
                  
                  // Calculate insert position (adjust for deletion)
                  const insertPos = dropPos > originalPos ? dropPos - 1 : dropPos
                  console.log('Insert pos:', insertPos) // Debug log
                  
                  // Create and insert the node
                  const node = view.state.schema.nodeFromJSON(dragData.node)
                  tr = tr.insert(insertPos, node)
                  
                  console.log('Dispatching transaction...') // Debug log
                  view.dispatch(tr)
                  console.log('Transaction dispatched successfully!') // Debug log
                  return true
                } else {
                  console.log('Dropped at the same position, no change.')
                  return true // Return true to prevent default handling
                }
              }
            }
          } catch (error) {
            console.error('Error handling drop:', error)
          }
        }
        return false
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      ImageResizeExtension.configure({
        types: ['image'],
      }),
      // ImageGallery, // Removed - using side-by-side images instead
      Quote,
      Song,
      Spotify,
      YouTube,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        type: "image",
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: onUploadImage || handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      console.log('Editor onUpdate - content length:', newContent.length);
      console.log('Editor onUpdate - image count:', (newContent.match(/<img/g) || []).length);
      isUpdatingFromEditor.current = true;
      lastEditorContent.current = newContent;
      onChange(newContent);
    },
  })

  // Update editor content when value changes externally
  // Only update if the value is genuinely different from what the editor has
  React.useEffect(() => {
    if (!editor) return;
    
    const currentEditorContent = editor.getHTML();
    
    // Only update if:
    // 1. The value prop is different from what's in the editor
    // 2. The value prop is different from the last content we sent from the editor
    // 3. We're not currently in the middle of an editor update
    if (value !== currentEditorContent && 
        value !== lastEditorContent.current && 
        !isUpdatingFromEditor.current) {
      editor.commands.setContent(value || '<p></p>');
      lastEditorContent.current = value || '<p></p>';
    }
    
    // Reset the flag after the effect runs
    isUpdatingFromEditor.current = false;
  }, [editor, value]);

  // Image resize functionality is handled by the ImageNode component

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper editor-mode">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              onUploadImage={onUploadImage}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
