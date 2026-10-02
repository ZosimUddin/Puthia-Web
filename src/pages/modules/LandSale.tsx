import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function LandSale({ onGoBack }: { onGoBack?: () => void } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="land-sale" />;
}
