import { create } from "zustand";

interface FilterState {
  searchQuery: string;
  selectedStatus: string;
  selectedCategory: string;
  startDate: string;
  endDate: string;
  selectedUser: string;
  selectedDepartment: string;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  setDateRange: (start: string, end: string) => void;
  setSelectedUser: (userId: string) => void;
  setSelectedDepartment: (deptId: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  selectedStatus: "ALL",
  selectedCategory: "ALL",
  startDate: "",
  endDate: "",
  selectedUser: "ALL",
  selectedDepartment: "ALL",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setDateRange: (startDate, endDate) => set({ startDate, endDate }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedDepartment: (selectedDepartment) => set({ selectedDepartment }),
  resetFilters: () =>
    set({
      searchQuery: "",
      selectedStatus: "ALL",
      selectedCategory: "ALL",
      startDate: "",
      endDate: "",
      selectedUser: "ALL",
      selectedDepartment: "ALL",
    }),
}));
