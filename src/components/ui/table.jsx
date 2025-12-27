import React from 'react';
import { Skeleton } from './skeleton';

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm ${className || ''}`}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={`[&_tr]:border-b ${className || ''}`} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={`[&_tr:last-child]:border-0 ${className || ''}`}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ${className || ''}`}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ''}`}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={`mt-4 text-sm text-muted-foreground ${className || ''}`}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Skeleton Components for Table
const TableRowSkeleton = ({ columns = 5, className }) => (
  <TableRow className={className}>
    {[...Array(columns)].map((_, index) => (
      <TableCell key={index}>
        <Skeleton className="h-4 w-full" />
      </TableCell>
    ))}
  </TableRow>
);
TableRowSkeleton.displayName = "TableRowSkeleton";

const TableSkeleton = ({ 
  rows = 5, 
  columns = 5, 
  showHeader = true,
  headerLabels = [],
  className 
}) => (
  <div className={`relative w-full overflow-auto ${className || ''}`}>
    <table className="w-full caption-bottom text-sm">
      {showHeader && (
        <TableHeader>
          <TableRow>
            {headerLabels.length > 0 ? (
              headerLabels.map((label, index) => (
                <TableHead key={index}>{label}</TableHead>
              ))
            ) : (
              [...Array(columns)].map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {[...Array(rows)].map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </TableBody>
    </table>
  </div>
);
TableSkeleton.displayName = "TableSkeleton";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableRowSkeleton,
  TableSkeleton,
};