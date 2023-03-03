import type { ParsehtmlIn, ParsehtmlOut } from '../../src/types'
export const parsehtml = <T extends ParsehtmlIn>(htmlTag: T[]): ParsehtmlOut[] => {
  const arrValue: ParsehtmlOut[] = []
  let isEmpty = false
  const dfs = (htmlTags, k: number) => {
    k++
    for (const tag of htmlTags) {
      // console.log(tag, 'tag')
      if (tag.value) {
        arrValue.push({
          parentNode: tag.parentNode.nodeName,
          content: tag.value,
          isEmpty,
          nodeName: tag.nodeName,
          func: () => {
            return tag.value
          },
        })
        isEmpty = false
      }
      if (tag.tagName) {
        isEmpty = !tag.childNodes.some(x => x.nodeName !== '#text')
        arrValue.push({
          parentNode: tag.parentNode.nodeName,
          nodeName: tag.nodeName,
          func: () => {
            const tagHtml = document.createElement(tag?.tagName)
            tagHtml.setAttribute('data-source', k)
            for (const attrs of tag.attrs)
              tagHtml.setAttribute(attrs.name, attrs.value)
            return tagHtml
          },
        })
        if (tag.childNodes && tag.childNodes !== 0)
          dfs(tag.childNodes, k)
      }
    }
  }
  dfs(htmlTag, 0)
  return arrValue
}
