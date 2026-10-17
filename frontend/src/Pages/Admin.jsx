import { useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PhotoIcon from "@mui/icons-material/Photo";
import PersonIcon from "@mui/icons-material/Person";
import FeedIcon from "@mui/icons-material/Feed";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

const FULL_WIDTH = 250;
const MINI_WIDTH = 72;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/admin/dashboard",
    roles: ["admin", "host"],
  },
  {
    text: "Add Host",
    icon: <PersonIcon />,
    path: "/admin/host",
    roles: ["admin"], // admin only
  },
  {
    text: "Add Advertisment",
    icon: <PhotoIcon />,
    path: "/admin/advertise",
    roles: ["admin", "host"],
  },
  {
    text: "View Submissions",
    icon: <FeedIcon />,
    path: "/admin/submissions",
    roles: ["admin", "host"],
  },
  {
    text: "Edit Form",
    icon: <EditIcon />,
    path: "/admin/form",
    roles: ["admin", "host"],
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const role = localStorage.getItem("role"); // "admin" or "host"
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";

  const compact = useMediaQuery(theme.breakpoints.down("md"));
  const drawerWidth = compact ? MINI_WIDTH : FULL_WIDTH;

  // only show the items this role is allowed to see
  const visibleItems = menuItems.filter((item) => item.roles.includes(role));

  const panelTitle = role === "admin" ? "Admin Panel" : "Host Panel";

  // protect routes: not logged in, or role not allowed on this page
  useEffect(() => {
    if (!token || !role) {
      navigate("/", { replace: true });
      return;
    }
    const current = menuItems.find((item) => item.path === location.pathname);
    if (current && !current.roles.includes(role)) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [token, role, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("Id");
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            fontWeight="bold"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {panelTitle}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              noWrap
              sx={{
                border: "1px solid white",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              {username} ({role})
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",

            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
            }),
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: compact ? 2 : 3,
              textAlign: compact ? "center" : "left",
            }}
          >
            <Typography
              variant={compact ? "h6" : "h5"}
              fontWeight="bold"
              color="primary"
            >
              {compact ? <AdminPanelSettingsIcon /> : " "}
            </Typography>
            {!compact && (
              <Typography variant="h5" color="text.secondary">
                {panelTitle}
              </Typography>
            )}
          </Box>

          <Divider />

          <List sx={{ px: 1, flexGrow: 1 }}>
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  <Tooltip title={compact ? item.text : ""} placement="right">
                    <ListItemButton
                      selected={isActive}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        justifyContent: compact ? "center" : "flex-start",
                        px: compact ? 1 : 2,

                        "&.Mui-selected": {
                          backgroundColor: "primary.main",
                          color: "white",

                          "& .MuiListItemIcon-root": {
                            color: "white",
                          },
                        },

                        "&.Mui-selected:hover": {
                          backgroundColor: "primary.dark",
                        },

                        "&:hover": {
                          backgroundColor: "primary.light",
                          color: "white",

                          "& .MuiListItemIcon-root": {
                            color: "white",
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: compact ? 0 : 2,
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      {!compact && <ListItemText primary={item.text} />}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>

          <Divider />

          <List sx={{ px: 1, py: 1 }}>
            <ListItem disablePadding>
              <Tooltip title={compact ? "Logout" : ""} placement="right">
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    color: "error.main",
                    justifyContent: compact ? "center" : "flex-start",
                    px: compact ? 1 : 2,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: compact ? 0 : 2,
                      justifyContent: "center",
                      color: "error.main",
                    }}
                  >
                    <LogoutIcon />
                  </ListItemIcon>

                  {!compact && <ListItemText primary="Logout" />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3, md: 4 },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}