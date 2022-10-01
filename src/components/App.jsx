import { ThemeProvider,createTheme, CssBaseline } from "@mui/material";
import React from "react";

import InfiniteBoard from "./InfiniteBoard";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {

  let r = <>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      Hello My App!
      <InfiniteBoard/>
    </ThemeProvider>
  </>

  return r;
}

export default App;