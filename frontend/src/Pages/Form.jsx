import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ChangeCircleIcon from "@mui/icons-material/Cached";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const PREVIEW_HEIGHT = 220;

const initialValues = {
  mobile: "",
  email: "",
  education: "",
  motherName: "",
  height: "",
  weight: "",
  dominantHand: "",
  nomineeName: "",
  nomineeDob: "",
  businessName: "",
  annualIncome: "",
};

const documentFields = [
  { name: "aadhaar", title: "Aadhaar Card", hint: "Clear front side photo of Aadhaar Card" },
  { name: "pan", title: "PAN Card", hint: "Clear front side photo of PAN Card" },
  { name: "cheque", title: "Cheque Photo", hint: "Clear photo of cancelled cheque" },
  { name: "passbook", title: "Bank Passbook Photo", hint: "Clear photo of bank passbook first page" },
];

const today = new Date().toISOString().split("T")[0];

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function Form() {
  const [values, setValues] = useState(initialValues);
  // files[name] = { file, url }
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  // keep latest files so we can free preview URLs on unmount
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      Object.values(filesRef.current).forEach(({ url }) =>
        URL.revokeObjectURL(url)
      );
    };
  }, []);

  /* ---------- handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "mobile") newValue = value.replace(/\D/g, "").slice(0, 10);

    setValues((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFile = (name) => (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [name]: "Only JPG, PNG or PDF allowed" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, [name]: "File must be under 5 MB" }));
      return;
    }

    setFiles((prev) => {
      if (prev[name]) URL.revokeObjectURL(prev[name].url); // free old preview
      return { ...prev, [name]: { file, url: URL.createObjectURL(file) } };
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const removeFile = (name) => {
    setFiles((prev) => {
      if (prev[name]) URL.revokeObjectURL(prev[name].url);
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleReset = () => {
    Object.values(files).forEach(({ url }) => URL.revokeObjectURL(url));
    setValues(initialValues);
    setFiles({});
    setErrors({});
    setStatus(null);
  };

  /* ---------- validation ---------- */
  const validate = () => {
    const err = {};

    if (!/^[6-9]\d{9}$/.test(values.mobile))
      err.mobile = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(values.email))
      err.email = "Enter a valid email address";
    if (!values.education.trim()) err.education = "Education is required";
    if (!values.motherName.trim()) err.motherName = "Mother name is required";
    if (!values.height || values.height < 50 || values.height > 250)
      err.height = "Enter 50–250 cm";
    if (!values.weight || values.weight < 10 || values.weight > 300)
      err.weight = "Enter 10–300 kg";
    if (!values.dominantHand) err.dominantHand = "Select one";
    if (!values.nomineeName.trim()) err.nomineeName = "Nominee name is required";
    if (!values.nomineeDob) err.nomineeDob = "Date of birth is required";
    if (!values.businessName.trim()) err.businessName = "Business name is required";
    if (values.annualIncome === "" || values.annualIncome < 0)
      err.annualIncome = "Enter annual income";

    documentFields.forEach(({ name, title }) => {
      if (!files[name]) err[name] = `${title} is required`;
    });

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) {
      setStatus({ type: "error", message: "Please fix the highlighted fields." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => formData.append(key, val));
    Object.entries(files).forEach(([key, { file }]) => formData.append(key, file));

    try {
      // const res = await fetch("http://localhost:5000/api/policy", {
      //   method: "POST",
      //   body: formData,
      // });
      // if (!res.ok) throw new Error("Failed");

      console.log([...formData.entries()]);

      handleReset();
      setStatus({ type: "success", message: "Form submitted successfully!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus({ type: "error", message: "Submission failed. Try again." });
    }
  };

  /* ---------- helpers ---------- */
  const startIcon = (IconComp) => ({
    startAdornment: (
      <InputAdornment position="start">
        <IconComp color="primary" />
      </InputAdornment>
    ),
  });

  const endText = (text) => ({
    endAdornment: <InputAdornment position="end">{text}</InputAdornment>,
  });

  const field = (name, label, extra = {}) => (
    <TextField
      fullWidth
      required
      name={name}
      label={label}
      value={values[name]}
      onChange={handleChange}
      error={Boolean(errors[name])}
      helperText={errors[name]}
      {...extra}
    />
  );

  const sectionTitle = (text, first = false) => (
    <Typography
      variant="h6"
      fontWeight="bold"
      color="primary"
      sx={{ mt: first ? 0 : 4, mb: 2 }}
    >
      {text}
    </Typography>
  );

  /* ---------- preview ---------- */
  const renderPreview = ({ file, url }, title) => {
    const isPdf = file.type === "application/pdf";

    return (
      <Box
        sx={{
          height: PREVIEW_HEIGHT,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#f1f3f8",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPdf ? (
          <Box
            component="iframe"
            src={url}
            title={`${title} preview`}
            sx={{ width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <Box
            component="img"
            src={url}
            alt={`${title} preview`}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fb", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        <Paper
          component="form"
          noValidate
          onSubmit={handleSubmit}
          elevation={3}
          sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3 }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Policy Login
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Please provide the following details for policy login.
          </Typography>

          {status && (
            <Alert severity={status.type} sx={{ mb: 3 }}>
              {status.message}
            </Alert>
          )}

          {/* ---------- Personal ---------- */}
          {sectionTitle("Personal Details", true)}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("mobile", "Mobile No.", {
                type: "tel",
                inputProps: { inputMode: "numeric", maxLength: 10 },
                InputProps: startIcon(PhoneIphoneIcon),
              })}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("email", "Email", {
                type: "email",
                InputProps: startIcon(EmailIcon),
              })}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {field("education", "Education", {
                InputProps: startIcon(SchoolIcon),
              })}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("motherName", "Mother Name", {
                InputProps: startIcon(PersonIcon),
              })}
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              {field("height", "Height", {
                type: "number",
                inputProps: { min: 50, max: 250 },
                InputProps: endText("cm"),
              })}
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              {field("weight", "Weight", {
                type: "number",
                inputProps: { min: 10, max: 300 },
                InputProps: endText("kg"),
              })}
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              {field("dominantHand", "Dominant Hand", {
                select: true,
                children: [
                  <MenuItem key="right" value="Right">Right</MenuItem>,
                  <MenuItem key="left" value="Left">Left</MenuItem>,
                  <MenuItem key="both" value="Both">Both</MenuItem>,
                ],
              })}
            </Grid>
          </Grid>

          {/* ---------- Nominee ---------- */}
          {sectionTitle("Nominee Details")}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("nomineeName", "Nominee Name", {
                InputProps: startIcon(PersonIcon),
              })}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("nomineeDob", "Nominee Date of Birth", {
                type: "date",
                InputLabelProps: { shrink: true },
                inputProps: { max: today },
                InputProps: startIcon(CalendarMonthIcon),
              })}
            </Grid>
          </Grid>

          {/* ---------- Business ---------- */}
          {sectionTitle("Business Details")}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("businessName", "Business Name", {
                InputProps: startIcon(BusinessCenterIcon),
              })}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              {field("annualIncome", "Annual Income", {
                type: "number",
                inputProps: { min: 0 },
                InputProps: startIcon(CurrencyRupeeIcon),
              })}
            </Grid>
          </Grid>

          {/* ---------- Documents ---------- */}
          {sectionTitle("Documents Required")}
          <Typography variant="body2" color="text.secondary" sx={{ mt: -1, mb: 2 }}>
            JPG, PNG or PDF — max 5 MB each.
          </Typography>

          <Grid container spacing={2}>
            {documentFields.map(({ name, title, hint }) => {
              const item = files[name];

              return (
                <Grid key={name} size={{ xs: 12, sm: 6 }} sx={{ display: "flex" }}>
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      p: 2,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: errors[name]
                        ? "error.main"
                        : item
                        ? "success.main"
                        : "primary.main",
                    }}
                  >
                    {/* heading */}
                    <Box>
                      <Typography fontWeight="bold" color="primary">
                        {title} *
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hint}
                      </Typography>
                    </Box>

                    {/* upload button OR preview */}
                    {!item ? (
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        sx={{ height: 48 }}
                      >
                        Upload
                        <input
                          hidden
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleFile(name)}
                        />
                      </Button>
                    ) : (
                      <>
                        {renderPreview(item, title)}

                        {/* file info + actions below the preview */}
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {item.file.type === "application/pdf" && (
                            <PictureAsPdfIcon color="error" fontSize="small" />
                          )}
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap fontWeight={500}>
                              {item.file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatSize(item.file.size)}
                            </Typography>
                          </Box>

                          <Tooltip title="Open in new tab">
                            <IconButton
                              size="small"
                              component="a"
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Replace">
                            <IconButton size="small" component="label" color="primary">
                              <ChangeCircleIcon fontSize="small" />
                              <input
                                hidden
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                onChange={handleFile(name)}
                              />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFile(name)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </>
                    )}

                    {errors[name] && (
                      <Typography variant="caption" color="error">
                        {errors[name]}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* ---------- Actions ---------- */}
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" variant="contained" size="large">
              Submit
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}