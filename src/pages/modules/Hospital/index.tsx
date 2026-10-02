import React from 'react';
import { ServiceDirectoryTemplate } from '../../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function HospitalPage({ onGoBack }: { onGoBack?: () => void } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="hospital" />;
}
