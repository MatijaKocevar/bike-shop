import type { Key, MouseEventHandler, ReactNode } from "react";

export type DataTableColumnFilter =
    | { type: "select"; key: string; options?: { value: string; label: string }[] }
    | { type: "text" };

export type DataTableColumn = {
    label?: ReactNode;
    srOnly?: boolean;
    className?: string;
    sortable?: boolean;
    filter?: DataTableColumnFilter;
};

export type DataTableCell = {
    content: ReactNode;
    className?: string;
    colSpan?: number;
    search?: string;
    sort?: string | number;
};

export type DataTableRow = {
    key?: Key;
    parentKey?: Key;
    cells: DataTableCell[];
    className?: string;
    title?: string;
    href?: string;
    onDoubleClick?: MouseEventHandler<HTMLTableRowElement>;
    filterValues?: Record<string, string>;
};
