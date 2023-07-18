import React from "react";
import { TableHead, TableRow, TableCell } from "@mui/material";

interface TableHeaderProps {
  header: string[];
}

const TableHeader: React.FC<TableHeaderProps> = ({ header }) => {
  return (
    <TableHead>
      <TableRow>
        {header.map((text) => (
          <TableCell key={text}>{text}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
