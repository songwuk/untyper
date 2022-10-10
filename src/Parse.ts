export const parsehtml = (htmlTag: any[]): any[] => {
  const arrValue: any[] = []
  const dfs = (htmlTags: any[]) => {
    for (const tag of htmlTags) {
      if (tag.value) {
        arrValue.push({
          value: tag.value,
          parentNode: tag.parentNode.nodeName,
        })
      }
      if (tag.tagName) {
        arrValue.push({
          tag: tag.tagName,
          attrs: tag.attrs ?? tag.attrs,
          parentNode: tag.parentNode.nodeName,
          end: tag.childNodes[tag.childNodes.length - 1].value,
        })
        if (tag.childNodes && tag.childNodes !== 0)
          dfs(tag.childNodes)
      }
    }
  }
  dfs(htmlTag)
  return arrValue
}
