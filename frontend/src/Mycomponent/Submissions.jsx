import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const API_URL = "http://localhost:5000/api/submissions"; // change to your backend URL

const COLUMNS = [
  { id: "id", label: "ID" },
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "policyType", label: "Policy Type" },
  { id: "status", label: "Status" },
  { id: "submittedAt", label: "Submitted On" },
];

const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "-";

export default function Submissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [policyType, setPolicyType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // sorting + pagination
  const [orderBy, setOrderBy] = useState("submittedAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load submissions");
        setRows(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // distinct policy types for the dropdown
  const policyTypes = [...new Set(rows.map((r) => r.policyType).filter(Boolean))];

  // filter + sort
  const q = search.trim().toLowerCase();

  const filtered = rows
    .filter((r) => {
      if (policyType !== "all" && r.policyType !== policyType) return false;

      if (fromDate && new Date(r.submittedAt) < new Date(fromDate)) return false;
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(r.submittedAt) > end) return false;
      }

      if (q) {
        const haystack = [r.id, r.name, r.email, r.phone, r.policyType, r.status]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const av = a[orderBy] ?? "";
      const bv = b[orderBy] ?? "";
      const cmp =
        orderBy === "submittedAt"
          ? new Date(av) - new Date(bv)
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return order === "asc" ? cmp : -cmp;
    });

  const visibleRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const hasFilters = search || policyType !== "all" || fromDate || toDate;

  // each handler resets to the first page when a filter changes
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handlePolicyType = (e) => {
    setPolicyType(e.target.value);
    setPage(0);
  };

  const handleFromDate = (e) => {
    setFromDate(e.target.value);
    setPage(0);
  };

  const handleToDate = (e) => {
    setToDate(e.target.value);
    setPage(0);
  };

  const handleRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const clearFilters = () => {
    setSearch("");
    setPolicyType("all");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Submissions
      </Typography>

      {/* Search + filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1fr 1fr 1fr",
            },
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ gridColumn: { xs: "auto", sm: "1 / -1", md: "auto" } }}
          />

          <TextField
            select
            size="small"
            label="Policy Type"
            value={policyType}
            onChange={handlePolicyType}
          >
            <MenuItem value="all">All</MenuItem>
            {policyTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            type="date"
            label="From"
            value={fromDate}
            onChange={handleFromDate}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            size="small"
            type="date"
            label="To"
            value={toDate}
            onChange={handleToDate}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>

        {hasFilters && (
          <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
            <Button size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear filters
            </Button>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper>
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell key={col.id} sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 5 }}>
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.policyType}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        color={STATUS_COLORS[row.status] || "default"}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(row.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Container>
  );
}