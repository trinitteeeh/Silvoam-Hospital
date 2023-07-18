import React from "react";
import { Toolbar, Typography, InputBase, IconButton, Tooltip, Popover, List, ListItemButton, ListItemText } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

interface FilterOption {
  value: string;
  text: string;
}

interface EnhancedTableToolbarProps {
  name: string;
  showSearch?: boolean;
  showFilter?: boolean;
  searchQuery: string;
  setSearchQuery: (string) => void;
  setFilterValue: (string) => void;
  filterOption: FilterOption[];
}

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  pl: { sm: 2 },
  pr: { xs: 1, sm: 1 },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = ({ name, showSearch = false, showFilter = false, searchQuery, setSearchQuery, setFilterValue, filterOption }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (index: string) => {
    setFilterValue(index);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "filter-options-popover" : undefined;

  return (
    <StyledToolbar>
      <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle" component="div">
        {name}
      </Typography>
      {showSearch && (
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </Search>
      )}
      {showFilter && (
        <>
          <Tooltip title="Filter list">
            <IconButton onClick={handleClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "center",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "right",
            }}
          >
            <List>
              {filterOption.map((filter, key) => (
                <ListItemButton key={key} onClick={() => handleClose(filter.value)}>
                  <ListItemText primary={filter.text} />
                </ListItemButton>
              ))}
            </List>
          </Popover>
        </>
      )}
    </StyledToolbar>
  );
};

export default EnhancedTableToolbar;
