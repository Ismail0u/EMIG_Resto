import jsPDF from "jspdf";
import "jspdf-autotable";
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";

const DataTable = ({ data, editableColumns, rowsPerPage, onUpdateStock, pdfFileName }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editableData, setEditableData] = useState(data);
  const [editingCell, setEditingCell] = useState(null);
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    setEditableData(data);
  }, [data]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const filteredData = editableData.filter((item) =>
    columns.some((col) =>
      String(item[col]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = sortBy
    ? [...filteredData].sort((a, b) =>
        typeof a[sortBy] === "string"
          ? a[sortBy].localeCompare(b[sortBy])
          : a[sortBy] - b[sortBy]
      )
    : filteredData;

  const handleCellChange = (value) => setTempValue(value);

  const handleKeyDown = async (e, rowIndex, colName) => {
    if (e.key === "Enter") {
      const newValue = tempValue.trim() === "" ? 0 : parseFloat(tempValue) || 0;
      setEditingCell(null);
      const updatedData = [...editableData];
      updatedData[rowIndex] = { ...updatedData[rowIndex], [colName]: newValue };
      setEditableData(updatedData);
      if (onUpdateStock) {
        try {
          await onUpdateStock(updatedData[rowIndex]["Produit"], colName, newValue);
          console.log("✅ Mise à jour réussie !");
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour du stock", error);
        }
      }
    }
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const exportToPDF = () => {
    const pdf = new jsPDF("landscape");
    pdf.text(pdfFileName || "Données Exportées", 14, 10);
    const tableColumn = columns;
    const tableRows = sortedData.map((item) => columns.map((col) => item[col]));
    pdf.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    pdf.save(`${pdfFileName || "export"}.pdf`);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          className="p-2 border border-gray-300 rounded-md w-1/3 text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Trier par
              <ChevronDown className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                {columns.map((col) => (
                  <button
                    key={col}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-100"
                    onClick={() => {
                      setSortBy(col);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            onClick={exportToPDF}
          >
            <FileText className="w-5 h-5" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 table-fixed text-black">
          <thead>
            <tr className="bg-blue-100 text-black text-base font-semibold">
              {columns.map((col) => (
                <th key={col} className="border p-3 text-center">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <tr key={rowIndex} className="border text-center hover:bg-blue-50 transition">
                  {columns.map((col) => {
                    const isEditable = editableColumns.includes(col);
                    return (
                      <td
                        key={col}
                        className={`border p-2 relative group text-sm ${
                          isEditable
                            ? "bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
                            : "bg-white"
                        }`}
                        onClick={() => {
                          if (isEditable) {
                            setEditingCell(`${rowIndex}-${col}`);
                            setTempValue(editableData[startIndex + rowIndex][col]);
                          }
                        }}
                      >
                        {editingCell === `${rowIndex}-${col}` ? (
                          <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => handleCellChange(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, startIndex + rowIndex, col)}
                            className="w-full p-1 border border-gray-300 rounded-md text-center text-black"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-center text-base text-gray-800 font-medium">
                            {editableData[startIndex + rowIndex][col]}
                            {isEditable && (
                              <Pencil className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 ml-2" />
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-2 text-center text-red-600">
                  Aucun résultat trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 p-2 border-t">
          <span className="text-gray-700 text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
