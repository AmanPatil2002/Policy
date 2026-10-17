import { useState } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const theme = createTheme({
  palette: {
    primary: { main: "#2373F4" },
    background: { default: "#F4F6F8", paper: "#FFFFFF" },
    text: { primary: "#0a0a0d", secondary: "#070707" },
    divider: "#E2E6EB",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        email: form.email.trim(),
        password: form.password,
      });

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("email", user.email);
      localStorage.setItem("role", user.role);
      localStorage.setItem("id", user.id); 

      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          "@supports (height: 100dvh)": { minHeight: "100dvh" },
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          py: { xs: 3, sm: 6 },
        }}
      >
        <Container maxWidth="xs" sx={{ px: { xs: 2, sm: 3 } }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                  Sign In
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Sign in to your account
                </Typography>
              </Box>

              <form onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    autoComplete="email"
                    fullWidth
                  />

                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    autoComplete="current-password"
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disableElevation
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              <Typography
                color="text.secondary"
                sx={{ mt: 3, textAlign: "center" }}
              >
                <Link component={RouterLink} to="/" fontWeight={600}>
                  Back
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
