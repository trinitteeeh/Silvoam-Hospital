import * as React from "react";
import { styled, useTheme, Theme, CSSObject, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import AuthContext from "../utils/AuthProvider";
import { useRouter } from "next/router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AccessibleIcon from "@mui/icons-material/Accessible";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import ArticleIcon from "@mui/icons-material/Article";
import BedroomParentIcon from "@mui/icons-material/BedroomParent";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import GroupIcon from "@mui/icons-material/Group";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer({ children }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const [openProfile, setOpenProfile] = React.useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOpenProfile(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setOpenProfile(null);
  };
  const { user, logout } = React.useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();

      // Logout successful
    } catch (error) {
      // Handle logout error
    }
  };

  const isMenuOpen = Boolean(openProfile);

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={openProfile}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleProfileMenuClose}
    >
      {user
        ? [
            <MenuItem key="logout" onClick={handleLogout}>
              Logout
            </MenuItem>,
          ]
        : [
            <MenuItem key="signin" onClick={() => router.push("/signin")}>
              Sign In
            </MenuItem>,
            <MenuItem key="signup" onClick={() => router.push("/signup")}>
              Sign Up
            </MenuItem>,
          ]}
    </Menu>
  );

  let taskList = [];
  if (!user) {
    taskList = [{ name: "Register", link: "/unauthorized/signin", icon: <DashboardIcon />, divider: true }];
  } else if (user.role == "Admin") {
    taskList = [
      { name: "Dashboard", link: "/dashboard", icon: <DashboardIcon />, divider: true },
      { name: "Registration Request", link: "/admin/manageRequest", icon: <AssignmentIcon />, divider: false },
      { name: "Manage Staff", link: "/admin/manageStaff", icon: <AssignmentIndIcon />, divider: true },
      { name: "Manage Room", link: "/manageRoom", icon: <BedroomParentIcon />, divider: false },
      { name: "Manage Patient", link: "/admin/managePatient", icon: <AccessibleIcon />, divider: true },
      { name: "Manage Ambulance", link: "/admin/manageAmbulance", icon: <AirportShuttleIcon />, divider: true },
      { name: "Manage Certificate", link: "/manageCertificate", icon: <ArticleIcon />, divider: true },
    ];
  } else if (user.role == "Pharmacist") {
    taskList = [
      { name: "Dashboard", link: "/dashboard", icon: <DashboardIcon />, divider: true },
      { name: "Manage Medicine", link: "/pharmacist/manageMedicine", icon: <VaccinesIcon />, divider: false },
      { name: "Manage Prescription", link: "/managePrescription", icon: <ReceiptLongIcon />, Divider: false },
    ];
  } else if (user.role == "Doctor") {
    taskList = [
      { name: "Dashboard", link: "/dashboard", icon: <DashboardIcon />, divider: true },
      { name: "Manage Appointment", link: "/manageAppointment", icon: <GroupIcon />, Divider: false },
      { name: "Manage Prescription", link: "/managePrescription", icon: <ReceiptLongIcon />, Divider: true },
      { name: "Manage Room", link: "/manageRoom", icon: <BedroomParentIcon />, divider: false },
      { name: "Manage Certificate", link: "/manageCertificate", icon: <ArticleIcon />, divider: true },
    ];
  } else if (user.role == "Nurse") {
    taskList = [
      { name: "Dashboard", link: "/dashboard", icon: <DashboardIcon />, divider: true },
      { name: "Manage Appointment", link: "/manageAppointment", icon: <GroupIcon />, Divider: false },
      { name: "Manage Room", link: "/manageRoom", icon: <BedroomParentIcon />, divider: true },
      { name: "Manage Certificate", link: "/manageCertificate", icon: <ArticleIcon />, divider: true },
    ];
  } else {
    taskList = [{ name: "Dashboard", link: "/dashboard", icon: <DashboardIcon />, divider: true }];
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Silvoam Hospital
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton size="large" aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton size="large" edge="end" aria-label="account of current user" aria-controls={menuId} aria-haspopup="true" onClick={handleProfileMenuOpen} color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMenu}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Typography variant="h6" noWrap component="div">
            {user ? "Welcome " + user.name : "Welcome Anonnym"}
          </Typography>
          <IconButton onClick={handleDrawerClose}>{theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {taskList.map((text, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }} onClick={() => router.push(text.link)}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {text.icon}
                </ListItemIcon>
                <ListItemText primary={text.name} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
              {text.divider === true ? <Divider /> : <></>}
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
