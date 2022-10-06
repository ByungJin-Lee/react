
import React from "react";

interface AbstractBoardProp {
  renderHeader(): JSX.Element
  renderItem(item: any): JSX.Element
  items: never[],
  className?: string,
}

const AbstractBoard : React.FC<AbstractBoardProp> = ({
  renderHeader,
  renderItem,
  items,
  className = ""
}) => {

  return (
    <div>
      { renderHeader() }
      <div className={className}>
        { items.map(renderItem) }
      </div>
    </div>
  );
}

export default AbstractBoard;