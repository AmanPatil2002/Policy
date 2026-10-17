import { Box, Button, Container, IconButton, Typography, Link } from "@mui/material";
import Grid from "@mui/material/Grid";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function Header() {
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: "#2373F4",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          alignItems="center"
          rowSpacing={{ xs: 0, sm: 1.5, md: 0 }}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{ py: { xs: 1, sm: 2, md: 2.5 } }}
        >
          {/* Admin Login: icon on mobile, button on tablet/desktop */}
          <Grid
            size={{ xs: "auto", sm: 6, md: 4 }}
            sx={{
              order: { xs: 1, sm: 2, md: 1 },
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            {/* Mobile: icon only */}
            <IconButton
              href="/login"
              aria-label="Admin Login"
              sx={{
                display: { xs: "inline-flex", sm: "none" },
                color: "#ffffff",
                border: "1px solid #ffffff",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              <AdminPanelSettingsIcon />
            </IconButton>

            {/* Tablet/Desktop: full button */}
            <Button
              variant="outlined"
              href="/login"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                color: "#ffffff",
                borderColor: "#ffffff",
                whiteSpace: "nowrap",
                px: { sm: 2, md: 3 },
                "&:hover": {
                  borderColor: "#ffffff",
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              Admin Login
            </Button>
          </Grid>

          {/* Title: center on mobile, own row on tablet, center on desktop */}
          <Grid
            size={{ xs: "grow", sm: 12, md: 4 }}
            sx={{ order: { xs: 2, sm: 1, md: 2 } }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                color: "#ffffff",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: { xs: "1.4rem", sm: "1.85rem", md: "2.125rem" },
              }}
            >
              Policy
            </Typography>
          </Grid>

          {/* Contact: right on all sizes (name and number stacked on mobile) */}
          <Grid
            size={{ xs: "auto", sm: 6, md: 4 }}
            sx={{ order: 3 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "#ffffff",
                textAlign: "right",
                fontSize: { xs: "0.7rem", sm: "1.05rem", md: "1.25rem" },
                lineHeight: { xs: 1.3, sm: 1.6 },
              }}
            >
              <Box component="span" sx={{ display: { xs: "block", sm: "inline" } }}>
                Raghavendra Koli
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  {" "}:{" "}
                </Box>
              </Box>
              <Link
                href="tel:1234567890"
                underline="none"
                sx={{
                  color: "inherit",
                  whiteSpace: "nowrap",
                  display: { xs: "block", sm: "inline" },
                  fontWeight: { xs: 600, sm: "inherit" },
                }}
              >
                123-456-7890
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}