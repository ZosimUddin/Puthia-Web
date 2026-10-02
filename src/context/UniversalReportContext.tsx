import React, { createContext, useContext, useState, ReactNode } from "react";
import { UniversalReportModal, ReportTarget } from "../components/common/UniversalReportModal";

interface UniversalReportContextType {
  openReportModal: (target: ReportTarget) => void;
  closeReportModal: () => void;
  isReportModalOpen: boolean;
  activeReportTarget: ReportTarget | null;
}

const UniversalReportContext = createContext<UniversalReportContextType | undefined>(undefined);

export const UniversalReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<ReportTarget | null>(null);

  const openReportModal = (reportTarget: ReportTarget) => {
    setTarget(reportTarget);
    setIsOpen(true);
  };

  const closeReportModal = () => {
    setIsOpen(false);
    setTarget(null);
  };

  return (
    <UniversalReportContext.Provider
      value={{
        openReportModal,
        closeReportModal,
        isReportModalOpen: isOpen,
        activeReportTarget: target,
      }}
    >
      {children}
      <UniversalReportModal
        isOpen={isOpen}
        onClose={closeReportModal}
        target={target}
      />
    </UniversalReportContext.Provider>
  );
};

export const useUniversalReport = (): UniversalReportContextType => {
  const context = useContext(UniversalReportContext);
  if (!context) {
    throw new Error("useUniversalReport must be used within a UniversalReportProvider");
  }
  return context;
};
