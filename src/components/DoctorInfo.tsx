import React from 'react';
import DoctorsPage from '../pages/modules/Doctors';

export const DoctorInfo = ({ onGoBack }: { onGoBack?: () => void } = {}) => {
  return <DoctorsPage onGoBack={onGoBack} />;
};

export default DoctorInfo;
