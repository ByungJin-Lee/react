import React, { useEffect } from "react";
import { useInfiniteQuery } from "react-query";

const debounce = (callback, delay) => {
  let waiter = 0;
  return (evt) => {
    if(waiter){
      clearTimeout(waiter);
    }
    waiter = setTimeout(()=>callback(evt), delay);
  }
}

const ISBoard = () => {

  const per_page = 30;

  const {
    data,
    status,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery(
    'data_query',
    async ({pageParam = 1})=>{
      const res = await fetch(`http://localhost:8080/page?page=${pageParam}&per_page=${per_page}`);
      return await res.json();
    },{
      getNextPageParam: (lastPage, allPage) => {
        const limit = Math.ceil(lastPage.totalCount / per_page);
        const expect = allPage.length + 1;
        return expect <= limit ? expect : undefined;
      }
    }
  );

  useEffect(()=>{
    const scrollObserver = debounce((evt) => {
      let totalHeight = document.body.clientHeight;
      let currentBottomPos = window.scrollY + window.innerHeight;

      if(totalHeight <= currentBottomPos + 150) {
        if(hasNextPage) {
          console.log('fetch');
          fetchNextPage();
        }
      }
    }, 150);

    document.addEventListener('scroll', scrollObserver);

    return ()=>document.removeEventListener('scroll', scrollObserver);
  }, [data]);

  return (
    <div>
      {
        status === 'success' 
        ? (
          data.pages.map(
            page => page.items.map(
              it => <p key={it.title}>{it.title}</p>
            )
          )
        )
        : (
          <div>wait</div>
        )
      }
    </div>
  )
}

export default ISBoard;