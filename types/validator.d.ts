export interface ValidationResult {
    isValid: boolean;
    message: string;
}
export declare function validateTopic(topic: string): ValidationResult;
