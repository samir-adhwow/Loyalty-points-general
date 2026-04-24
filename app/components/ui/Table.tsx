type Column = {
  field: string;
  headerName: string;
  align?: "left" | "right" | "center";
  renderCell?: (
    value: unknown,
    row: Record<string, unknown>,
  ) => React.ReactNode;
  className?: string;
  cellClassName?: string;
};

type TableProps = {
  columns?: Column[];
  data?: Record<string, unknown>[];
};

export default function Table({ columns = [], data = [] }: TableProps) {
  const hasRows = data.length > 0;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm p-4">
        {/* Header */}
        {hasRows && (
          <thead>
            <tr className="bg-lighter">
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={`
          border-b border-light px-4 py-2 
          text-xs font-bold uppercase tracking-widest text-label
          ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
          ${col.className ?? ""}
        `}
                >
                  {col.headerName}
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Body */}
        <tbody className="">
          {hasRows ? (
            data.map((row, rowIndex) => (
              <tr
                key={(row.id as string) ?? rowIndex}
                className="group transition-colors duration-100 hover:bg-lightest px-4"
              >
                {columns.map((col) => {
                  const value = row[col.field];
                  const content =
                    typeof col.renderCell === "function"
                      ? col.renderCell(value, row)
                      : ((value as React.ReactNode) ?? "-");

                  return (
                    <td
                      key={`${(row.id as string) ?? rowIndex}-${col.field}`}
                      className={`
                        py-3 px-4
                        ${rowIndex !== data.length - 1 ? "border-b border-lighter" : ""}
                        ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                        ${col.cellClassName ?? ""}
                      `}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length || 1} className="py-16 text-center">
                <p className="text-base font-semibold text-gray-700 mb-1">
                  No data yet
                </p>
                <p className="text-sm text-gray-400">
                  There is no data to display at the moment.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
