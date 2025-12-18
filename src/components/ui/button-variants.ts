import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#34B27B]/80 text-white hover:bg-[#34B27B]",
        destructive: "bg-red-500/80 text-white hover:bg-red-500",
        outline:
          "border border-white/10 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
        secondary: "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
        ghost: "text-white/60 hover:bg-white/10 hover:text-white/80",
        link: "text-[#34B27B] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 py-2",
        sm: "h-7 rounded-lg px-3 text-xs",
        lg: "h-10 px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
