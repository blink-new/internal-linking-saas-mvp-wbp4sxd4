import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date: string | Date) => {
  return dayjs(date).format('MMM D, YYYY')
}

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow()
}

export const formatDuration = (startTime: string, endTime?: string) => {
  const start = dayjs(startTime)
  const end = endTime ? dayjs(endTime) : dayjs()
  const duration = end.diff(start, 'second')
  
  if (duration < 60) {
    return `${duration}s`
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}m ${duration % 60}s`
  } else {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num)
}