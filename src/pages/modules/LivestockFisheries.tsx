import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function LivestockFisheries({ onGoBack, initialTab }: { onGoBack?: () => void; initialTab?: string } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="livestock-fisheries" />;
}
