
import React from "react";

const AbstractBoard = ({
  renderHeader,
  renderItem,
  items
}) => {

  let r = <div>
    <div>
      { renderHeader() }
    </div>
    <div className="infinite-scroll-con">
      { items.map(renderItem) }
    </div>
  </div>

  return r;
}

export default AbstractBoard;