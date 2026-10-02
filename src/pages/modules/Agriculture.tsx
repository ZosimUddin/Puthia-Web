import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function Agriculture({ onGoBack, initialTab }: { onGoBack?: () => void; initialTab?: string } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="agriculture" />;
}
