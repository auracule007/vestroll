import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";


export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    
    if (!isValid(date)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid date provided: ${dateInput}`);
      }
      return "";
    }
    
    return format(date, "MMM dd, yyyy");
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Error formatting date: ${dateInput}`, error);
    }
    return "";
  }
}


export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    
    if (!isValid(date)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid date provided: ${dateInput}`);
      }
      return "";
    }
    
    return format(date, "MMM dd, yyyy HH:mm");
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Error formatting date: ${dateInput}`, error);
    }
    return "";
  }
}


export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (!start || !end) return "";
  
  return `${start} - ${end}`;
}


export function formatRelativeDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    
    if (!isValid(date)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid date provided: ${dateInput}`);
      }
      return "";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Error formatting date: ${dateInput}`, error);
    }
    return "";
  }
}


export function formatDateCustom(
  dateInput: string | Date | null | undefined,
  formatStr: string
): string {
  if (!dateInput) return "";
  
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    
    if (!isValid(date)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid date provided: ${dateInput}`);
      }
      return "";
    }
    
    return format(date, formatStr);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Error formatting date: ${dateInput}`, error);
    }
    return "";
  }
}


export function formatDateLocale(
  dateInput: string | Date | null | undefined,
  locale: string = "en-NG"
): string {
  if (!dateInput) return "";
  
  try {
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    
    if (!isValid(date)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Invalid date provided: ${dateInput}`);
      }
      return "";
    }
    
    return date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Error formatting date: ${dateInput}`, error);
    }
    return "";
  }
}
