export const validateUrl = (url) => {
  if (!url) return "URL is required";
  try {
    new URL(url);
    return true;
  } catch {
    return "Please enter a valid URL";
  }
};

export const validateJSON = (json) => {
  if (!json) return true; // Optional field
  try {
    JSON.parse(json);
    return true;
  } catch {
    return "Please enter valid JSON";
  }
};

export const validateNumber = (value, min, max, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min) return `${fieldName} must be at least ${min}`;
  if (num > max) return `${fieldName} must be at most ${max}`;
  return true;
};
