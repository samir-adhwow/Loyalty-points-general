"use client";

import {
  Box,
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";

type TableProps = {
  columns?: any[];
  data?: any[];
};

export default function Table({ columns = [], data = [] }: TableProps) {
  const hasRows = data.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, rgba(255, 255, 255, 1) 22%)",
      }}
    >
      <TableContainer sx={{ maxHeight: 560 }}>
        <MuiTable stickyHeader aria-label="data table">
          <TableHead
            sx={{
              boxShadow: hasRows
                ? "inset 0 -2px 0 color-mix(in srgb, var(--color-primary) 20%, transparent)"
                : undefined,
            }}
          >
            {hasRows && (
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    align={column.align || "left"}
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      textTransform: "uppercase",
                      fontSize: 12,
                      color: "text.secondary",
                      backgroundColor: "#f8fafc",
                      borderBottom: "2px solid",
                      borderColor: "primary.light",
                      py: 1.5,
                      ...column.sx,
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {hasRows ? (
              data.map((row, rowIndex) => (
                <TableRow
                  hover
                  key={row.id ?? rowIndex}
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "rgba(25, 118, 210, 0.03)",
                    },
                    "&:last-child td": { borderBottom: 0 },
                    transition: "background-color 160ms ease",
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.field];
                    const content =
                      typeof column.renderCell === "function"
                        ? column.renderCell(value, row)
                        : value ?? "-";

                    return (
                      <TableCell
                        key={`${row.id ?? rowIndex}-${column.field}`}
                        align={column.align || "left"}
                        sx={{
                          py: 1.5,
                          borderColor: "divider",
                          ...column.cellSx,
                        }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length || 1} sx={{ py: 8 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                      No data yet
                    </Typography>
                    <Typography color="text.secondary">
                      There is no data to display at the moment.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Paper>
  );
}
