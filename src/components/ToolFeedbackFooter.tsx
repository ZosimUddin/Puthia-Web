import { ReportProblemLink } from "./ReportProblemLink";
import { ToolFeedback } from "./ToolFeedback";

interface Props {
  contentId: string;
  contentTitle: string;
}

export const ToolFeedbackFooter = ({ contentId, contentTitle }: Props) => {
  return (
    <div className="mt-16 flex flex-col items-center gap-6 border-t border-slate-200/60 pt-10 pb-16 px-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="transform scale-110">
          <ToolFeedback contentId={contentId} />
        </div>
        <div className="flex justify-center pt-2">
          <ReportProblemLink contentId={contentId} contentTitle={contentTitle} />
        </div>
      </div>
    </div>
  );
};
