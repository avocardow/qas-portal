import { EmailMessage } from "./emailService";
import { EmailService } from "./emailService";

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

// Implementation of EmailFilteringService with pagination support
export class DefaultEmailFilteringService implements EmailFilteringService {
  private emailService: EmailService;
  // In-memory cache for filtered results keyed by criteria and pageSize
  private static cache = new Map<string, EmailMessage[]>();

  constructor(emailService?: EmailService) {
    this.emailService = emailService ?? new EmailService();
  }

  async getFilteredMessages(
    criteria: EmailFilterCriteria,
    page: number = 1,
    pageSize: number = 5
  ): Promise<{ messages: EmailMessage[]; nextLink?: string }> {
    const { contactEmails, subjectKeywords, folderIds } = criteria;
    // Determine folders to search
    const folders = folderIds ?? (await this.emailService.listFolders()).map(f => f.id);

    // Build cache key based on criteria and pageSize
    const cacheKey = JSON.stringify({ criteria, pageSize });
    let allFiltered = DefaultEmailFilteringService.cache.get(cacheKey);
    if (!allFiltered) {
      allFiltered = [];
      // Fetch and filter all messages across folders
      for (const folderId of folders) {
        let folderPage = 1;
        let hasNext = true;
        while (hasNext) {
          // Fetch larger batches to minimize API calls
          const fetchSize = pageSize * 10;
          const { messages, nextLink } = await this.emailService.listMessages(
            folderId,
            folderPage,
            fetchSize
          );
          // Apply filtering criteria
          const filtered = messages.filter(
            msg =>
              contactEmails.includes(msg.from.emailAddress.address) ||
              msg.toRecipients.some(rec => contactEmails.includes(rec.emailAddress.address)) ||
              subjectKeywords.some(keyword => msg.subject.includes(keyword))
          );
          allFiltered.push(...filtered);
          folderPage++;
          hasNext = !!nextLink;
        }
      }
      // Sort by receivedDateTime descending
      allFiltered.sort((a, b) => (a.receivedDateTime < b.receivedDateTime ? 1 : -1));
      // Cache full filtered results
      DefaultEmailFilteringService.cache.set(cacheKey, allFiltered);
    }

    // Paginate combined results
    const start = (page - 1) * pageSize;
    const messagesPage = allFiltered.slice(start, start + pageSize);
    const nextLink = allFiltered.length > start + pageSize ? String(page + 1) : undefined;
    return { messages: messagesPage, nextLink };
  }
} 