
import React from "react";

import { useInfiniteScroll, generateDumbBoardItems } from '../lib/customHooks';

import AbstractBoard from "./AbstractBoard";

const renderHeader = () => {
  return <div>안녕하세요 헤더입니다.</div>
}

const renderItem = (value, index) => {
  return <div className="item" key={value.title}>
      <div><img src={value.thumbnailUrls['x192']} alt="" /></div>
      <div>{value.title} {value.writer}</div>
    </div>
}

const fetchItems = async (prevItems, pageCursor, itemCountPerScroll) => {
  const items = generateDumbBoardItems(1000);

  const startIdx = (pageCursor - 1) * itemCountPerScroll; 

  return prevItems.concat(items.slice(
    Math.min(startIdx, items.length),
    Math.min(startIdx + itemCountPerScroll, items.length)
  ))
}

const InfiniteBoard = () => {

  const [items, pageCursor] = useInfiniteScroll(30, fetchItems, 30);

  let r = (
    <AbstractBoard  
      renderHeader={renderHeader}
      renderItem={renderItem}
      items={items} />
  )

  return r;
}

export default InfiniteBoard;