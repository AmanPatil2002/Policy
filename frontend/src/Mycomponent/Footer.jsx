
import {
  Box,
  Container,
  Typography,
} from "@mui/material";


export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#2373F4",
        color: "white",
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              py: 3,
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              letterSpacing: 1,
              fontWeight: 500,
            }}
          >
            Tata AIA © {new Date().getFullYear()}. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
