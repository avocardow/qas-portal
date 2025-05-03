import { describe, it, expect, vi } from 'vitest';
import { DefaultEmailFilteringService, EmailFilterCriteria } from './emailFilterService';
import { EmailMessage, MailFolder, EmailService } from './emailService';

class MockEmailService {
  listFolders = vi.fn<Promise<MailFolder[]>, []>();
  listMessages = vi.fn<Promise<{ messages: EmailMessage[]; nextLink?: string }>, [string, number, number]>();

  constructor(private messages: EmailMessage[]) {
    this.listFolders.mockResolvedValue([{ id: 'f1', displayName: 'Folder1' }]);
    this.listMessages.mockImplementation(async (_folderId, page, pageSize) => {
      const skip = (page - 1) * pageSize;
      const data = this.messages.slice(skip, skip + pageSize);
      const nextLink = this.messages.length > skip + pageSize ? 'next' : undefined;
      return { messages: data, nextLink };
    });
  }
}

const generateMessages = (count: number): EmailMessage[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    subject: `subject ${i + 1}`,
    bodyPreview: '',
    from: { emailAddress: { name: '', address: '' } },
    toRecipients: [],
    receivedDateTime: `${20200101 + i}`,
    isRead: false,
  }));

describe('DefaultEmailFilteringService Pagination', () => {
  it('should correctly paginate and manage nextLink', async () => {
    const messages = generateMessages(12);
    const mockService = new MockEmailService(messages);
    const filterService = new DefaultEmailFilteringService(mockService as unknown as EmailService);

    const criteria: EmailFilterCriteria = { contactEmails: [], subjectKeywords: [''] };

    // Page 1
    const res1 = await filterService.getFilteredMessages(criteria, 1, 5);
    expect(res1.messages).toHaveLength(5);
    expect(res1.messages.map(m => m.id)).toEqual(['12', '11', '10', '9', '8']);
    expect(res1.nextLink).toBe('2');

    // Page 2
    const res2 = await filterService.getFilteredMessages(criteria, 2, 5);
    expect(res2.messages).toHaveLength(5);
    expect(res2.messages.map(m => m.id)).toEqual(['7', '6', '5', '4', '3']);
    expect(res2.nextLink).toBe('3');

    // Page 3
    const res3 = await filterService.getFilteredMessages(criteria, 3, 5);
    expect(res3.messages).toHaveLength(2);
    expect(res3.messages.map(m => m.id)).toEqual(['2', '1']);
    expect(res3.nextLink).toBeUndefined();

    // Ensure underlying service called only once due to caching
    expect(mockService.listMessages).toHaveBeenCalledTimes(1);
  });
}); 