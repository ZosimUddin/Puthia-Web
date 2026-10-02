import React from 'react';
import HospitalPage from '../pages/modules/Hospital';

export const HospitalInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  return <HospitalPage onGoBack={onGoBack} />;
};

export default HospitalInfo;
