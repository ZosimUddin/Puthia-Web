import React from 'react';
import { ServiceDirectoryTemplate } from '../../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function DoctorsPage({ onGoBack }: { onGoBack?: () => void } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="doctor" />;
}
