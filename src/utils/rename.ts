
export function rename(obj){
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => rename(item))
  }

  const newObj = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (key === 'dependencies') {
        newObj['children'] = rename(value)
      } else {
        newObj[key] = rename(value)
      }
    }
  }

  return newObj
}