import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function ImportantPlacesPage({ onGoBack }: { onGoBack?: () => void } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="important-place" />;
}
