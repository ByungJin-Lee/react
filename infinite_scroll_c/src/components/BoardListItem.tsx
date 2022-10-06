import React from "react";

import {
  Paper
} from "@mui/material";

const BoardListItem = ({item} : {item: any}) => {
  return <Paper sx={{ width: 1}}>{item.title}</Paper>
}


export default BoardListItem;