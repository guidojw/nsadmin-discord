'use strict'
function diffDays (date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0)
  d2.setHours(0, 0, 0)
  return Math.round(Math.abs((d1 - d2) / (24 * 60 * 60 * 1000)))
}

function getDate (date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return getReadableDate({ day, month, year })
}

function getDateInfo (dateString) {
  const day = parseInt(dateString.substring(0, dateString.indexOf('-')))
  const month = parseInt(dateString.substring(dateString.indexOf('-') + 1, dateString.lastIndexOf('-')))
  const year = parseInt(dateString.substring(dateString.lastIndexOf('-') + 1, dateString.length))
  return { day, month: month - 1, year }
}

function getDurationString (milliseconds) {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
  const daysMilliseconds = milliseconds % (24 * 60 * 60 * 1000)
  const hours = Math.floor(daysMilliseconds / (60 * 60 * 1000))
  const hoursMilliseconds = milliseconds % (60 * 60 * 1000)
  const minutes = Math.floor(hoursMilliseconds / (60 * 1000))
  const minutesMilliseconds = milliseconds % (60 * 1000)
  const seconds = Math.floor(minutesMilliseconds / (1000))
  return `${days > 0 ? days + 'd ' : ''}${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds > 0 ? seconds + 's ' : ''}`
}

function getReadableDate (opts) {
  return `${opts.day}-${opts.month}-${opts.year}`
}

function getReadableTime (opts) {
  return `${opts.hours}:${'0'.repeat(2 - String(opts.minutes).length)}${opts.minutes}`
}

function getTime (date) {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return getReadableTime({ hours, minutes })
}

function getTimeInfo (timeString) {
  const hours = parseInt(timeString.substring(0, timeString.indexOf(':')))
  const minutes = parseInt(timeString.substring(timeString.indexOf(':') + 1, timeString.length))
  return { hours, minutes }
}

function isDst (date) {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.max(jan, jul) !== date.getTimezoneOffset()
}

module.exports = {
  diffDays,
  getDate,
  getDateInfo,
  getDurationString,
  getTime,
  getTimeInfo,
  isDst
}