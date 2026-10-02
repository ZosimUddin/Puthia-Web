import React from "react";
import GlobalReviewSystem from "./GlobalReviewSystem";

interface RatingReviewsListProps {
  itemId: string;
  itemName: string;
  itemCategory?: string;
}

export const RatingReviewsList: React.FC<RatingReviewsListProps> = ({
  itemId,
  itemName,
  itemCategory = "general",
}) => {
  return (
    <GlobalReviewSystem
      itemId={itemId}
      itemName={itemName}
      itemCategory={itemCategory}
    />
  );
};

export default RatingReviewsList;
