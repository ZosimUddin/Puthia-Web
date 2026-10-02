import React from 'react';
import DiagnosticPage from '../pages/modules/Diagnostic';

export const DiagnosticInfo = ({ onGoBack }: { onGoBack: () => void }) => {
  return <DiagnosticPage onGoBack={onGoBack} />;
};
