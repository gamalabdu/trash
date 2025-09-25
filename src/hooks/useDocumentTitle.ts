import { useEffect } from 'react'

export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title
    document.title = `TRASH - ${title}`
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}
