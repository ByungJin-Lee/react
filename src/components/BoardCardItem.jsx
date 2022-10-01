import React from "react";

import { 
  Card, 
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography
} from "@mui/material";

import {
  MoreVert
} from "@mui/icons-material";

const BoardCardItem = ({
  item
}) => {
  let r = (
  <Card elevation={4}  sx={{ minWidth:200}}>
    <CardHeader
      action={
        <IconButton aria-label="settings">
          <MoreVert />
        </IconButton>
      }
      title={item.title}
      subheader={item.subTitle}
    />

    { /** TODO change thumbnail size about View-port size */ }
    <CardMedia 
      component={'img'}
      image={item.thumbnailUrls['x192']}
      height={180}
      alt={item.title}
    />

    <CardContent>
      <Typography paragraph variant="body2" color="text.secondary">
        {item.detail}
      </Typography>
    </CardContent>
  </Card>
  )

  return r;
}

export default BoardCardItem;