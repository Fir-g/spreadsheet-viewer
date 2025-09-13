import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilesFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  documentTypeFilter: string;
  setDocumentTypeFilter: (type: string) => void;
  sortField: string;
  sortDirection: string;
  setSortField: (field: string) => void;
  setSortDirection: (direction: string) => void;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export const FilesFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  documentTypeFilter,
  setDocumentTypeFilter,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  filteredCount,
  totalCount,
  onClearFilters,
}: FilesFiltersProps) => {
  const hasActiveFilters = searchTerm || statusFilter !== "all" || 
    typeFilter !== "all" || documentTypeFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* Filter Dropdowns in Responsive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="uploaded">Uploaded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="xlsx">XLSX</SelectItem>
          </SelectContent>
        </Select>

        <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Doc Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doc Types</SelectItem>
            <SelectItem value="ddq">DDQ</SelectItem>
            <SelectItem value="lpa">LPA</SelectItem>
            <SelectItem value="ppm">PPM</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="cashflows">Cashflows</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${sortField}-${sortDirection}`}
          onValueChange={(value) => {
            const [field, direction] = value.split("-");
            setSortField(field);
            setSortDirection(direction);
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uploaded_at-desc">Date (Newest)</SelectItem>
            <SelectItem value="uploaded_at-asc">Date (Oldest)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredCount} of {totalCount} files
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};