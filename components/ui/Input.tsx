import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, rightElement, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-poppins font-semibold text-xs uppercase tracking-wider text-cb-navy"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full px-4 py-3 bg-white border-2 border-cb-navy rounded font-inter text-sm text-cb-navy placeholder:text-cb-gray",
              "shadow-hard-sm focus:shadow-hard focus:outline-none focus:border-cb-red",
              "transition-all duration-150",
              error && "border-red-500",
              rightElement && "pr-12",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-inter">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-poppins font-semibold text-xs uppercase tracking-wider text-cb-navy"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3 bg-white border-2 border-cb-navy rounded font-inter text-sm text-cb-navy placeholder:text-cb-gray",
            "shadow-hard-sm focus:shadow-hard focus:outline-none focus:border-cb-red",
            "transition-all duration-150 resize-none",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 font-inter">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
