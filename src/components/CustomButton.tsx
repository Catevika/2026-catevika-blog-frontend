import type { CustomButtonProps } from "@/types";
import { forwardRef } from "react";

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ icon: Icon, className, disabled, text, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={Boolean(disabled)}
        {...props}
        className={className}
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
