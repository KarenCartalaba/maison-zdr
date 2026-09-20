export function formatDate(
  date: string | Date,
  dateLocale: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
) {
  return new Date(date).toLocaleDateString(dateLocale, options);
}
