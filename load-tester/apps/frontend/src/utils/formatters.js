export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return "N/A";
  return Number(num).toLocaleString();
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const formatLatency = (ms) => {
  if (ms === null || ms === undefined) return "N/A";
  return `${Number(ms).toFixed(2)} ms`;
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return "N/A";
  return `${Number(value).toFixed(2)}%`;
};
