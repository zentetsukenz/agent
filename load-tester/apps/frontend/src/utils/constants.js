export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export const TEST_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const TEST_LIMITS = {
  DURATION: { MIN: 1, MAX: 300 },
  CONNECTIONS: { MIN: 1, MAX: 1000 },
  RPS: { MIN: 1, MAX: 100000 },
};

export const POLL_INTERVAL = 2000; // 2 seconds
