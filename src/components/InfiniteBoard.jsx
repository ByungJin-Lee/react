
import React, { useCallback, useMemo } from "react";

import { useInfiniteScroll, generateDumbBoardItems, useToggleButtonGroup } from '../lib/customHooks';

import AbstractBoard from "./AbstractBoard";
import BoardCardItem from "./BoardCardItem";
import BoardListItem from "./BoardListItem";

const renderHeader = () => {
  return <div>안녕하세요 헤더입니다.</div>
}

const fetchItems = (collection) => async (prevItems, pageCursor, itemCountPerScroll) => {

  const startIdx = (pageCursor - 1) * itemCountPerScroll; 

  return prevItems.concat(collection.slice(
    Math.min(startIdx, collection.length),
    Math.min(startIdx + itemCountPerScroll, collection.length)
  ))
}

const InfiniteBoard = () => {

  const collection = useMemo(()=>generateDumbBoardItems(1000), []);

  const [selected, ToggleBtnGroup] = useToggleButtonGroup({
    card: 'Card',
    list: 'List'
  })

  const [items, pageCursor] = useInfiniteScroll(30, fetchItems(collection), 30);

  const renderItem = (value) => {
    return ( 
      selected === 'card' 
      ? <BoardCardItem key={value.title} item={value} /> 
      : <BoardListItem /> 
    );
  }

  const renderToolBox = () => {
    return ToggleBtnGroup;
  }

  let r = (
  <AbstractBoard  
    renderToolBox={renderToolBox}
    renderHeader={renderHeader}
    renderItem={renderItem}
    items={items} />
  )

  return r;
}

export default InfiniteBoard;