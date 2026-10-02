import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function MelaPage({ onGoBack }: { onGoBack?: () => void } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="mela" />;
}
