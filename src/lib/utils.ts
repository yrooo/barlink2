import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats phone number to Indonesian format (+62)
 * Converts numbers starting with '0' to start with '62'
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with country code
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return phoneNumber;
  
  // Remove all non-numeric characters
  let cleanNumber = phoneNumber.replace(/[^\d]/g, '');
  
  // If number starts with '0', replace with '62'
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }
  // If number doesn't start with '62', prepend '62'
  else if (!cleanNumber.startsWith('62')) {
    cleanNumber = '62' + cleanNumber;
  }
  
  return cleanNumber;
}
