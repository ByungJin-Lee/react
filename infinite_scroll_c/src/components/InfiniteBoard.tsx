
import React, { 
  useEffect, 
  useMemo, 
  useState 
} from "react";

import styled from "@emotion/styled";

import { 
  useInfiniteScroll, 
  useToggleButtonGroup 
} from '../lib/hooks';

import {
  generateDumbBoardItems,
  processDuplicated
} from '../lib/tools';

import AbstractBoard from "./AbstractBoard";
import BoardCardItem from "./BoardCardItem";
import BoardListItem from "./BoardListItem";

interface ItemInterface {
  title: string
}

const renderHeader = () => {
  return <div>안녕하세요 헤더입니다.</div>
}

const compareItem = (lhs: ItemInterface, rhs: ItemInterface) => {
  return lhs.title === rhs.title;
}

const renderCardItem = (it: any) => {
  return <BoardCardItem key={it.title} item={it} />
}

const renderListItem = (it: any) => {
  return <BoardListItem key={it.title} item={it} />;
}

const InfiniteBoard = () => {

  const collection = useMemo(()=>generateDumbBoardItems(1000), []);

  const [items, setItems] = useState([]);

  const [page, unblock] = useInfiniteScroll(50);

  const [selected, ToggleBtnGroup] = useToggleButtonGroup({
    card: 'Card',
    list: 'List'
  })

  useEffect(()=>{

    // 여기는 없어질 로직
    const start = (page - 1) * 50; 

    const added = collection.slice(start, start + 50) as never[];
    // 여기 까지

    setItems((prev)=>{

      const [processed, duplicated] = processDuplicated(
        prev,
        added,
        compareItem
      );

      if(duplicated > 0){
        if (confirm("아이템이 추가되었습니다. 처음으로 돌아가시겠습니까?")){
          window.scrollTo(0,0)
          setTimeout(()=>location.reload(), 1000);
        }
      }

      return prev.concat(processed as never[]);
    });

    unblock();
    // return () => setItems([]);

  }, [page]);

  const StyledAbstractBoard = styled(AbstractBoard)`
    display: grid;
    grid-template-columns: ${()=>selected === 'card' ? '1fr 1fr' : '1fr'};
    margin: 1em;
    gap: 8px;    
  `;

  return (
    <>
      <ToggleBtnGroup />
      <StyledAbstractBoard
        renderHeader={ renderHeader }
        renderItem={ 
          selected === 'card' 
            ? renderCardItem 
            : renderListItem 
          }
        items={ items } 
      />
    </>
  );
}

export default InfiniteBoard;