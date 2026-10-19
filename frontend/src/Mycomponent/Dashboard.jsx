import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PhotoIcon from "@mui/icons-material/Photo";
import FeedIcon from "@mui/icons-material/Feed";
import BusinessIcon from "@mui/icons-material/Business";

const API_URL = "http://localhost:5000/api/submissions";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalHosts: 0,
    totalAds: 0,
    recentSubmissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch submissions
        const submissionsRes = await fetch(API_URL, { headers });
        if (!submissionsRes.ok) throw new Error("Failed to load submissions");
        const submissions = await submissionsRes.json();

        // Calculate stats
        const totalSubmissions = submissions.length;
        const recentSubmissions = submissions.slice(0, 5);

        // Mock stats for hosts and ads (these would need separate API calls)
        const totalHosts = 3; // This would come from /auth/hosts endpoint
        const totalAds = 5; // This would come from /api/advertisements endpoint

        setStats({
          totalSubmissions,
          totalHosts,
          totalAds,
          recentSubmissions,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading dashboard: {error}
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon, color = "primary" }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              color: "white",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            icon={<FeedIcon />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Hosts"
            value={stats.totalHosts}
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Advertisements"
            value={stats.totalAds}
            icon={<PhotoIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Submissions
              </Typography>
              {stats.recentSubmissions.length === 0 ? (
                <Typography color="text.secondary">No recent submissions</Typography>
              ) : (
                <Box>
                  {stats.recentSubmissions.map((submission) => (
                    <Box
                      key={submission.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {submission.client_name || "Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {submission.client_email}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" color="primary">
                          {submission.policyType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  View all submissions
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Manage advertisements
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Create new host
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Edit policy form
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}