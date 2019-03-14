const e = module.exports

e.parseNumber = (number, defaultValue, min = null, max = null) => {
  number = parseInt(number)

  if (isNaN(number)) {
    return defaultValue
  }

  if (max !== null && number > max) {
    return max
  }

  if (min !== null && number < min) {
    return min
  }

  return number
}