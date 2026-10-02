import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export default function SocialInstitutions({ onGoBack }: { onGoBack?: () => void } = {}) {
  return <ServiceDirectoryTemplate serviceKeyParam="social-institution" />;
}
