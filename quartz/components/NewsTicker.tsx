import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/newsTicker.scss"
// @ts-ignore
import script from "./scripts/newsTicker.inline"
import fs from "fs"
import path from "path"

interface Options {
  filePath: string
}

const defaultOptions: Options = {
  filePath: "content/Архив/Private/news.md", 
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function getNewsContent(): string | null {
    try {
      const contentPath = path.join(process.cwd(), opts.filePath)
      if (!fs.existsSync(contentPath)) return null

      const fileContent = fs.readFileSync(contentPath, "utf-8")
      const contentWithoutFrontmatter = fileContent.replace(/^---[\s\S]*?---\s*/, "")
      return contentWithoutFrontmatter.replace(/\n/g, " ").trim()
    } catch (e) {
      console.warn("NewsTicker: Could not read news file", e)
      return null
    }
  }

  const NewsTicker: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    const newsText = getNewsContent()

    if (!newsText) return null

    const repetitions = [1, 2, 3, 4]

    return (
      <div class={`news-ticker-wrapper ${displayClass ?? ""}`} id="news-ticker-container">
        <div class="news-ticker-track">
          {repetitions.map((i) => (
            <div class="news-ticker-content" aria-hidden={i > 1 ? "true" : undefined}>
              {newsText}
            </div>
          ))}
        </div>
        
        <button id="news-ticker-close" aria-label="Close news">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    )
  }

  NewsTicker.css = style
  NewsTicker.afterDOMLoaded = script
  return NewsTicker
}) satisfies QuartzComponentConstructor
