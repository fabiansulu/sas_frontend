import React, { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <PaginationContext.Provider value={{
      page,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      setPage,
      setRowsPerPage,
    }}>
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => useContext(PaginationContext);