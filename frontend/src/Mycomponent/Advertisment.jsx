import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const API_URL = "http://localhost:5000/api/advertisements"; // change to your backend URL
const FILE_BASE = "http://localhost:5000";
const MAX_FILES = 10;
const MAX_SIZE_MB = 5;

const isValidLink = (value) => {
  if (!value.trim()) return true; // link is optional
  try {
    return ["http:", "https:"].includes(new URL(value.trim()).protocol);
  } catch {
    return false;
  }
};

// One posted advertisement
function AdCard({ ad, index, total, onToggle, onSaveLink, onMove, onDelete, showOwner }) {
  const [link, setLink] = useState(ad.linkUrl || "");
  const linkInvalid = !isValidLink(link);
  const changed = link.trim() !== (ad.linkUrl || "");

  return (
    <Card sx={{ display: "flex", flexDirection: "column", opacity: ad.isActive ? 1 : 0.6 }}>
      <CardMedia
        component="img"
        height="170"
        image={`${FILE_BASE}${ad.filePath}`}
        alt={ad.originalName || "Advertisement"}
        sx={{ objectFit: "cover" }}
      />
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
        {showOwner && (
          <Chip size="small" label={`Uploader #${ad.uploadedBy}`} sx={{ alignSelf: "flex-start" }} />
        )}

        <TextField
          size="small"
          label="Link (optional)"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          error={linkInvalid}
          helperText={linkInvalid ? "Enter a valid http/https URL" : ""}
        />
        {changed && !linkInvalid && (
          <Button size="small" variant="outlined" onClick={() => onSaveLink(ad.id, link.trim())}>
            Save link
          </Button>
        )}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={!!ad.isActive}
                onChange={(e) => onToggle(ad.id, e.target.checked)}
              />
            }
            label={ad.isActive ? "Active" : "Hidden"}
          />
          <Box>
            <IconButton size="small" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Move up">
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              disabled={index === total - 1}
              onClick={() => onMove(index, 1)}
              aria-label="Move down"
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(ad.id)} aria-label="Delete">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default function Advertisement() {
  const fileInputRef = useRef(null);
  const itemsRef = useRef([]); // latest items, used to free preview URLs on unmount

  const [items, setItems] = useState([]); // new uploads: { key, file, preview, link }
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };
  const role = localStorage.getItem("role"); // assumes you store the role; adjust if needed

  itemsRef.current = items;
  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview));
  }, []);

  const loadAds = async () => {
    try {
      const res = await fetch(API_URL, { headers: authHeader });
      if (!res.ok) throw new Error("Failed to load advertisements");
      setAds(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleFiles = (e) => {
    setError("");
    const selected = Array.from(e.target.files);
    const room = MAX_FILES - items.length;
    const added = [];

    for (const f of selected) {
      if (!f.type.startsWith("image/")) {
        setError("Only image files are allowed");
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each image must be under ${MAX_SIZE_MB} MB`);
        continue;
      }
      if (added.length >= room) {
        setError(`You can upload up to ${MAX_FILES} images at a time`);
        break;
      }
      added.push({
        key: `${f.name}-${f.lastModified}-${Math.random()}`,
        file: f,
        preview: URL.createObjectURL(f),
        link: "",
      });
    }

    setItems((prev) => [...prev, ...added]);
    e.target.value = "";
  };

  const setItemLink = (key, link) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, link } : i)));

  const removeItem = (key) => {
    const target = items.find((i) => i.key === key);
    if (target) URL.revokeObjectURL(target.preview);
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const resetForm = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]);
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("Please choose at least one image");
      return;
    }
    if (items.some((i) => !isValidLink(i.link))) {
      setError("One or more links are not valid http/https URLs");
      return;
    }

    const formData = new FormData();
    items.forEach((i) => formData.append("images", i.file));
    formData.append("links", JSON.stringify(items.map((i) => i.link.trim())));

    try {
      setSubmitting(true);
      const res = await fetch(API_URL, { method: "POST", headers: authHeader, body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setSuccess("Advertisements uploaded");
      resetForm();
      loadAds();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const patch = async (url, body) => {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Request failed");
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await patch(`${API_URL}/${id}`, { isActive });
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: isActive ? 1 : 0 } : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveLink = async (id, linkUrl) => {
    try {
      await patch(`${API_URL}/${id}`, { linkUrl });
      setAds((prev) => prev.map((a) => (a.id === id ? { ...a, linkUrl: linkUrl || null } : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMove = async (index, direction) => {
    const next = [...ads];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    setAds(next); // update immediately
    try {
      await patch(`${API_URL}/reorder`, { ids: next.map((a) => a.id) });
    } catch (err) {
      setError(err.message);
      loadAds(); // roll back to server order
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advertisement?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: authHeader });
      if (!res.ok) throw new Error("Failed to delete advertisement");
      setAds((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Advertisements
      </Typography>

      {/* Upload */}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload images
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => fileInputRef.current.click()}
          disabled={items.length >= MAX_FILES}
        >
          Choose Images
        </Button>
        <Typography variant="caption" sx={{ ml: 1.5 }} color="text.secondary">
          {items.length}/{MAX_FILES} selected, up to {MAX_SIZE_MB} MB each
        </Typography>

        {items.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              mt: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            }}
          >
            {items.map((item) => (
              <Box key={item.key} sx={{ border: "1px solid #ddd", borderRadius: 1, p: 1 }}>
                <Box sx={{ position: "relative", height: 130, mb: 1 }}>
                  <Box
                    component="img"
                    src={item.preview}
                    alt="preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeItem(item.key)}
                    aria-label="Remove image"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <TextField
                  size="small"
                  fullWidth
                  label="Link (optional)"
                  placeholder="https://..."
                  value={item.link}
                  onChange={(e) => setItemLink(item.key, e.target.value)}
                  error={!isValidLink(item.link)}
                  helperText={!isValidLink(item.link) ? "Enter a valid http/https URL" : ""}
                />
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
          <Button onClick={resetForm} disabled={submitting || items.length === 0}>
            Reset
          </Button>
          <Button variant="contained" onClick={handleUpload} disabled={submitting}>
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Upload"}
          </Button>
        </Box>
      </Paper>

      {/* Posted */}
      <Typography variant="h6" gutterBottom>
        Posted advertisements
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : ads.length === 0 ? (
        <Typography color="text.secondary">No advertisements yet</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          }}
        >
          {ads.map((ad, index) => (
            <AdCard
              key={ad.id}
              ad={ad}
              index={index}
              total={ads.length}
              showOwner={role === "admin"}
              onToggle={handleToggle}
              onSaveLink={handleSaveLink}
              onMove={handleMove}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}