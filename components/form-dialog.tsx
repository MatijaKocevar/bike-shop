"use client";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FormDialogProps = {
    open: boolean;
    onCloseHref: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
};

export function FormDialog({
    open,
    onCloseHref,
    title,
    description,
    className,
    children,
}: FormDialogProps) {
    const router = useRouter();

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) router.replace(onCloseHref, { scroll: false });
            }}
        >
            <DialogContent
                className={cn(
                    "max-h-[95dvh] grid-rows-[auto] overflow-y-auto p-4 sm:grid-rows-[auto_minmax(0,1fr)] sm:p-6 lg:p-8",
                    className,
                )}
            >
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                )}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
            </DialogContent>
        </Dialog>
    );
}
