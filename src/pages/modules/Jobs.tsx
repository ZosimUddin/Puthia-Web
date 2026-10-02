import React from 'react';
import { ServiceDirectoryTemplate } from '../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

interface JobsProps {
  initialType?: string;
}

const Jobs: React.FC<JobsProps> = ({ initialType }) => {
  return <ServiceDirectoryTemplate serviceKeyParam="job" />;
};

export default Jobs;
