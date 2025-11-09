import { Outlet } from "react-router";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import { Divider, Drawer, Stack } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router";

export const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav>
        <AppBar position="fixed" color="primary">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Stack width={150} paddingTop='1rem' paddingRight='1rem' justifyContent={'left'}>
                <Typography variant="h5" sx={{ px: 2, py: 1 }}>
                  WatchOut
                </Typography>
                <Divider />
                <div>
                  <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="body1" sx={{ px: 2, py: 1 }}>
                      Home
                    </Typography>
                  </Link>
                  <Link to="/event-types" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="body1" sx={{ px: 2, py: 1 }}>
                      Event Types
                    </Typography>
                  </Link>
                  <Typography variant="body1" sx={{ px: 2, py: 1 }}>
                    Settings
                  </Typography>
                  <Typography variant="body1" sx={{ px: 2, py: 1 }}>
                    Profile
                  </Typography>
                </div>
              </Stack>
            </Drawer>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WatchOut
            </Typography>
          </Toolbar>
        </AppBar>
      </nav>
      <Outlet />
    </div>
  );
};
