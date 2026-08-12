import { cn } from "@/lib/design/cn";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
};

export function DataTable<T>({ columns, rows, rowKey, onRowClick, className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-borde bg-superficie shadow-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-fondo">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "border-b border-borde px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate",
                    c.align === "right" && "text-right"
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-borde last:border-0",
                  onRowClick && "cursor-pointer hover:bg-azul-claro"
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3.5 align-top",
                      c.align === "right" && "text-right"
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}