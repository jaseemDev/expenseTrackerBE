import morgan from "morgan";
import { httpLogger } from "../utils/logger.js";

// Custom token for user ID
morgan.token("user-id", (req) => {
  return req.user?.id || req.body?.userId || "anonymous";
});

// Custom token for request body (be careful with sensitive data)
morgan.token("body", (req) => {
  // Don't log sensitive fields
  const sensitiveFields = ["password", "token", "resetToken"];
  const body = { ...req.body };

  sensitiveFields.forEach((field) => {
    if (body[field]) {
      body[field] = "[REDACTED]";
    }
  });

  return JSON.stringify(body);
});

// HTTP request logger
export const httpRequestLogger = morgan(
  ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  {
    stream: {
      write: (message) => httpLogger.info(message.trim()),
    },
  }
);

// Detailed logger for development
export const detailedLogger = morgan(
  ":method :url :status :response-time ms - :res[content-length] - User: :user-id - Body: :body",
  {
    stream: {
      write: (message) => httpLogger.info(message.trim()),
    },
  }
);
