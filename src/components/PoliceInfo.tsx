import React from 'react';
import { ServiceDirectoryTemplate } from './common/MasterServiceTemplate/ServiceDirectoryTemplate';

export const PoliceInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  return <ServiceDirectoryTemplate serviceKeyParam="police" isEmbedded={true} />;
};
