import { pathToRoot, joinSegments } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>
        <img src={joinSegments(baseDir, "static/logo.png")} alt={title} class="logo" />
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  margin: 0;
  /* Убираем стили шрифта, так как теперь здесь картинка */
  display: flex;
  align-items: center;
}

.page-title a {
  display: block;
  line-height: 0; /* Убирает лишний отступ снизу картинки */
}

.logo-image {
  height: 80px; /* Настройте высоту логотипа под ваш дизайн */
  width: auto;
  object-fit: contain;
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor