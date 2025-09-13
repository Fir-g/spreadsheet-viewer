import { useState, useMemo } from 'react';
import type { FileData } from '@/types';

interface UseFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  documentTypeFilter: string;
  setDocumentTypeFilter: (type: string) => void;
  sortField: string;
  setSortField: (field: string) => void;
  sortDirection: string;
  setSortDirection: (direction: string) => void;
  filteredAndSortedFiles: FileData[];
  clearFilters: () => void;
}

export const useFilters = (files: FileData[]): UseFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("uploaded_at");
  const [sortDirection, setSortDirection] = useState<string>("desc");

  const filteredAndSortedFiles = useMemo(() => {
    // First filter
    const filtered = files.filter((file) => {
      const matchesSearch = (file.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (file.status || "").toLowerCase() === statusFilter.toLowerCase();
      const matchesType =
        typeFilter === "all" ||
        (file.type || "").toLowerCase() === typeFilter.toLowerCase();
      const matchesDocumentType =
        documentTypeFilter === "all" ||
        (file.document_type || "").toLowerCase() ===
          documentTypeFilter.toLowerCase();
      return (
        matchesSearch && matchesStatus && matchesType && matchesDocumentType
      );
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        aValue = new Date(a.uploaded_at);
        bValue = new Date(b.uploaded_at);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [files, searchTerm, statusFilter, typeFilter, documentTypeFilter, sortField, sortDirection]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDocumentTypeFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    documentTypeFilter,
    setDocumentTypeFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filteredAndSortedFiles,
    clearFilters,
  };
};