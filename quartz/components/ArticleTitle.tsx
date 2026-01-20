import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { joinSegments, pathToRoot } from "../util/path"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  const icon = fileData.frontmatter?.icon
  if (title) {
    return (
      <h1 class={classNames(displayClass, "article-title")}>
        {icon && (
          <img
            src={joinSegments(pathToRoot(fileData.slug!), "static/icons", icon)}
            class="article-icon"
          />
        )}{" "}
        {title}
      </h1>
    )
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor