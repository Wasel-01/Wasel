// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  // UAE phone number format: +971XXXXXXXXX
  const uaePhoneRegex = /^\+971[0-9]{9}$/;
  return uaePhoneRegex.test(phone);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

// License plate validation for UAE
export const validateLicensePlate = (plate: string): boolean => {
  // UAE license plate format: XX-NNNNN (2 letters, 5 numbers)
  const licensePlateRegex = /^[A-Z]{2}-\d{5}$/;
  return licensePlateRegex.test(plate);
};

// Validate trip capacity (between 1-8 passengers)
export const validateTripCapacity = (capacity: number): boolean => {
  return capacity >= 1 && capacity <= 8;
};

// Validate trip price (minimum 5 AED, maximum 1000 AED)
export const validateTripPrice = (price: number): boolean => {
  return price >= 5 && price <= 1000;
};

// Validate booking date (must be in the future)
export const validateBookingDate = (date: Date): boolean => {
  const now = new Date();
  return date > now;
};