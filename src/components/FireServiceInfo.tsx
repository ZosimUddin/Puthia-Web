import React from 'react';
import { ServiceDirectoryTemplate } from './common/MasterServiceTemplate/ServiceDirectoryTemplate';

export const FireServiceInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  return <ServiceDirectoryTemplate serviceKeyParam="fire-service" isEmbedded={true} />;
};
