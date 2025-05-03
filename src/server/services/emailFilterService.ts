import { EmailMessage } from "./emailService";

/**
 * Criteria for filtering emails.
 */
export interface EmailFilterCriteria {
  /** List of contact email addresses to filter by */
  contactEmails: string[];
  /** List of keywords to match in the email subject */
  subjectKeywords: string[];
  /** Optional folder IDs to restrict filtering */
  folderIds?: string[];
}

/**
 * Service interface for filtering emails with pagination support.
 */
export interface EmailFilteringService {
  /**
   * Get filtered messages based on the provided criteria with pagination.
   * @param criteria Filtering criteria
   * @param page Page number (1-based)
   * @param pageSize Number of items per page
   */
  getFilteredMessages(
    criteria: EmailFilterCriteria,
    page?: number,
    pageSize?: number
  ): Promise<{ messages: EmailMessage[]; nextLink?: string }>;
} 