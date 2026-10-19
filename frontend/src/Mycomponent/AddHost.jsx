import { useEffect, useState } from "react";
import {
  Box, Paper, TextField, Button, Typography, Alert, Table, TableHead,
  TableRow, TableCell, TableBody, Switch, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const API = "http://localhost:5000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// small wrapper: returns { ok, data } and never throws
const request = async (path, options = {}) => {
  try {
    const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...options });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { message: "Cannot reach the server" } };
  }
};

export default function AddHost() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null); // { type, text }
  const [hosts, setHosts] = useState([]);

  // edit dialog
  const [editHost, setEditHost] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editError, setEditError] = useState("");

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadHosts = async () => {
    const { ok, data } = await request("/auth/hosts");
    if (ok) setHosts(data.hosts);
    else setMsg({ type: "error", text: data.message || "Failed to load hosts" });
  };

  useEffect(() => { loadHosts(); }, []);

  // ---------- create ----------
  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg(null);
    const { ok, data } = await request("/auth/hosts", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!ok) return setMsg({ type: "error", text: data.message });
    setMsg({ type: "success", text: "Host created" });
    setEmail("");
    setPassword("");
    loadHosts();
  };

  // ---------- enable / disable ----------
  const toggleActive = async (host) => {
    setMsg(null);
    const { ok, data } = await request(`/auth/hosts/${host.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !host.is_active }),
    });
    if (!ok) setMsg({ type: "error", text: data.message });
    loadHosts();
  };

  // ---------- edit ----------
  const openEdit = (host) => {
    setEditHost(host);
    setEditEmail(host.email);
    setEditPassword("");
    setEditActive(!!host.is_active);
    setEditError("");
  };

  const closeEdit = () => setEditHost(null);

  const handleEditSave = async () => {
    setEditError("");
    const body = { is_active: editActive };
    if (editEmail.trim().toLowerCase() !== editHost.email) body.email = editEmail;
    if (editPassword) body.password = editPassword; // blank = keep current password

    const { ok, data } = await request(`/auth/hosts/${editHost.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (!ok) return setEditError(data.message);
    closeEdit();
    setMsg({ type: "success", text: "Host updated" });
    loadHosts();
  };

  // ---------- delete ----------
  const handleDelete = async () => {
    const { ok, data } = await request(`/auth/hosts/${deleteTarget.id}`, {
      method: "DELETE",
    });
    setDeleteTarget(null);
    setMsg(
      ok
        ? { type: "success", text: "Host deleted" }
        : { type: "error", text: data.message }
    );
    loadHosts();
  };

  return (
    <Box>
      {/* Add host */}
      <Paper component="form" onSubmit={handleCreate} sx={{ p: 3, mb: 3, maxWidth: 420 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Add Host</Typography>
        {msg && (
          <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>
            {msg.text}
          </Alert>
        )}
        <TextField label="Host email" type="email" fullWidth required sx={{ mb: 2 }}
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password (min 8 chars)" type="password" fullWidth required sx={{ mb: 2 }}
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" variant="contained">Create Host</Button>
      </Paper>

      {/* Hosts list */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={1}>Hosts</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hosts.map((h) => (
              <TableRow key={h.id}>
                <TableCell>{h.email}</TableCell>
                <TableCell>{new Date(h.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Switch checked={!!h.is_active} onChange={() => toggleActive(h)} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(h)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(h)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {hosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No hosts yet</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit dialog */}
      <Dialog open={!!editHost} onClose={closeEdit} fullWidth maxWidth="xs">
        <DialogTitle>Edit Host</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <TextField label="Host email" type="email" fullWidth required sx={{ mt: 1, mb: 2 }}
            value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          <TextField label="New password (leave blank to keep current)" type="password"
            fullWidth sx={{ mb: 2 }} helperText="Min 8 characters"
            value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
          <FormControlLabel
            control={<Switch checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />}
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete host?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget?.email} will be permanently removed. If you only want to
            block access, disable the host instead.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}