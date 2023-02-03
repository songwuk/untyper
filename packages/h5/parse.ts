import type { ParsehtmlIn, ParsehtmlOut } from '../../src/types'
export const parsehtml = <T extends ParsehtmlIn>(htmlTag: T[]): ParsehtmlOut[] => {
  // console.log('-----', htmlTag, '-----')
  const arrValue: ParsehtmlOut[] = []
  const dfs = (htmlTags, k: number) => {
    k++
    for (const tag of htmlTags) {
      if (tag.value) {
        arrValue.push({
          parentNode: tag.parentNode.nodeName,
          func: () => {
            return tag.value
          },
        })
      }
      if (tag.tagName) {
        arrValue.push({
          parentNode: tag.parentNode.nodeName,
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
  // console.log(arrValue, 'arrValue')
  return arrValue
}
