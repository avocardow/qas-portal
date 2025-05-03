import React from 'react';
import { useRouter } from 'next/navigation';
import { useAbility } from '@/hooks/useAbility';
import { CLIENT_PERMISSIONS } from '@/constants/permissions';
import Button from '@/components/ui/button/Button';
import Authorized from '@/components/Authorized';

interface QuickActionButtonsProps {
  clientId: string;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ clientId }) => {
  const { can } = useAbility();
  const router = useRouter();

  const handleAddContact = () => {
    router.push(`/dashboard/app/clients/${clientId}/edit`);
  };

  const handleLinkBankFeed = () => {
    console.log('Link bank feed for client', clientId);
  };

  const handleRequestDocument = () => {
    console.log('Request document for client', clientId);
  };

  const handleScheduleAudit = () => {
    router.push(`/dashboard/app/audits/new?clientId=${clientId}`);
  };

  const handleArchiveClient = () => {
    if (can(CLIENT_PERMISSIONS.ARCHIVE)) {
      if (window.confirm('Are you sure you want to archive this client?')) {
        console.log('Archive client', clientId);
      }
    }
  };

  return (
    <div className="flex space-x-2 mb-6">
      <Authorized action={CLIENT_PERMISSIONS.EDIT}>
        <Button onClick={handleAddContact}>Add Contact</Button>
      </Authorized>
      <Button onClick={handleLinkBankFeed}>Link Bank Feed</Button>
      <Button onClick={handleRequestDocument}>Request Document</Button>
      <Button onClick={handleScheduleAudit}>Schedule Audit</Button>
      <Authorized action={CLIENT_PERMISSIONS.ARCHIVE}>
        <Button onClick={handleArchiveClient} color="danger">
          Archive Client
        </Button>
      </Authorized>
    </div>
  );
};

export default QuickActionButtons; 