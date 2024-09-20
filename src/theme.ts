import { CommonColors, createTheme } from "@mui/material";

type CreateThemeOptions = Exclude<Parameters<typeof createTheme>[0], undefined>;

declare module "@mui/material" {
  export interface CommonColors {
    yellow: {
      main: string;
      light: string;
      dark: string;
    };
    green: {
      main: string;
      light: string;
      dark: string;
    };
    red: {
      main: string;
      light: string;
      dark: string;
    };
    blue: {
      main: string;
      light: string;
      dark: string;
    };
    cyan: {
      main: string;
      light: string;
      dark: string;
    };
  }
}

const commonColors: CommonColors = {
  black: "#1E1E1E",
  white: "#FFFFFF",
  yellow: {
    main: "#F5AC47",
    light: "#F5D976",
    dark: "#F57F17",
  },
  green: {
    main: "#59BE81",
    light: "#9AEFBC",
    dark: "#178D46",
  },
  red: {
    main: "#D35B5B",
    light: "#EF9A9A",
    dark: "#B71C1C",
  },
  blue: {
    main: "#61A9F2",
    light: "#C2E0FF",
    dark: "#0072E5",
  },
  cyan: {
    main: "#4DA0AA",
    light: "#9AE0EF",
    dark: "#006064",
  },
};

let theme = createTheme({
  palette: {
    contrastThreshold: 4.5,
    background: {
      default: "#F8F9FA",
    },
    action: {
      selected: "#CFD8DC",
      hover: "#ECEFF1",
    },
    grey: {
      "50": "#FFFFFF",
      "100": "#F8F9FA",
      "200": "#DADBDC",
      "300": "#BFC0C0",
      "400": "#9A9A9B",
      "500": "#656565",
      "600": "#616161",
      "700": "#5C5C5C",
      "800": "#212121",
      "900": "#1E1E1E",
    },
    common: {
      ...commonColors,
    },
  },
  shape: {
    borderRadius: 4,
  },
});

theme = createTheme(theme, {
  palette: {
    primary: theme.palette.augmentColor({
      color: {
        main: "#455A64",
        light: "#263238",
        dark: "#90A4AE",
      },
      name: "primary",
    }),
    warning: theme.palette.augmentColor({
      color: {
        main: commonColors.yellow.main,
        light: commonColors.yellow.light,
        dark: commonColors.yellow.dark,
      },
      name: "warning",
    }),
    success: theme.palette.augmentColor({
      color: {
        main: commonColors.green.main,
        light: commonColors.green.light,
        dark: commonColors.green.dark,
      },
      name: "success",
    }),
    error: theme.palette.augmentColor({
      color: {
        main: commonColors.red.main,
        light: commonColors.red.light,
        dark: commonColors.red.dark,
      },
      name: "error",
    }),
    info: theme.palette.augmentColor({
      color: {
        main: commonColors.blue.main,
        light: commonColors.blue.light,
        dark: commonColors.blue.dark,
      },
      name: "info",
    }),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: ({ ownerState, theme }) => ({
          ...(ownerState.color === "primary" && {
            "&:hover": {
              backgroundColor: "#263238",
            },
            "&:active": {
              backgroundColor: "#263238",
            },
            "&.Mui-disabled": {
              backgroundColor: theme.palette.action.selected,
              color: theme.palette.common.white,
            },
          }),
        }),
      },
    },
  },
  typography: {
/*    h6: {
      fontSize: "1.25rem",
      fontWeight: 500,
      lineHeight: 1.465,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.171875,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.025625,
    },*/
  },
} as CreateThemeOptions);

export { theme };
