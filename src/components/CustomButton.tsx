import { forwardRef } from "react";
import type { CustomButtonProps } from "@/types";
import { cn } from "@/utils/cnUtils";

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ icon: Icon, className, disabled, text, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={Boolean(disabled)}
        {...props}
        className={cn("plain", className)}
      >
        {Icon && (
          <Icon className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
        )}
        {text}
      </button>
    );
  },
);

CustomButton.displayName = "CustomButton";

export default CustomButton;
