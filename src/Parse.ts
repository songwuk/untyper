export const parsehtml = (htmlTag: any[]): any[] => {
  const arrValue: any[] = []
  const dfs = (htmlTags: any[]) => {
    for (const tag of htmlTags) {
      if (tag.value) {
        arrValue.push({
          func: () => {
            return tag.value
          },
        })
      }
      if (tag.tagName) {
        arrValue.push({
          func: () => {
            const tagHtml = document.createElement(tag?.tagName)
            for (const attrs of tag.attrs)
              tagHtml.setAttribute(attrs.name, attrs.value)
            return tagHtml
          },
        })
        if (tag.childNodes && tag.childNodes !== 0)
          dfs(tag.childNodes)
      }
    }
  }
  dfs(htmlTag)
  return arrValue
}
