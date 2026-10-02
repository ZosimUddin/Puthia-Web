import React from 'react';
import { ServiceDirectoryTemplate } from './common/MasterServiceTemplate/ServiceDirectoryTemplate';

export const EntrepreneurCornerInfo = ({ onGoBack }: { onGoBack?: () => void }) => {
  return <ServiceDirectoryTemplate serviceKeyParam="entrepreneur" isEmbedded={true} />;
};

