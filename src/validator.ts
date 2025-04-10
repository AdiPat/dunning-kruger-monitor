export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export function validateTopic(topic: string): ValidationResult {
  if (!topic.trim()) {
    return {
      isValid: false,
      message: "Topic cannot be empty",
    };
  }

  if (topic.length < 3) {
    return {
      isValid: false,
      message: "Topic must be at least 3 characters long",
    };
  }

  if (topic.length > 100) {
    return {
      isValid: false,
      message: "Topic must not exceed 100 characters",
    };
  }

  return {
    isValid: true,
    message: "Topic is valid",
  };
}
