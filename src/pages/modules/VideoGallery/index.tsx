import React from 'react';
import { ServiceDirectoryTemplate } from '../../../components/common/MasterServiceTemplate/ServiceDirectoryTemplate';

export const VideoGallery: React.FC<{ isEmbed?: boolean }> = ({ isEmbed = false }) => {
  return <ServiceDirectoryTemplate serviceKeyParam="video" isEmbedded={isEmbed} />;
};

export default VideoGallery;
