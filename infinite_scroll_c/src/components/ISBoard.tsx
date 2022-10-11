import { useEffect } from "react";
import { useWindowEvent } from "../lib/hooks";
import { getScrollDispatcher } from "../lib/tools";
import useInfinitePage from "../lib/useInfinitePage";

interface Page {
  total_count: number,
  items: any[]
}

function getNextCursor(lastPage: Page, totalPages: Page[]) {
  const expect = totalPages.length + 1;
  const limit = Math.ceil(lastPage.total_count / 30);

  return limit > expect ? expect : undefined;
}

async function fetchNextPage(nextCursor: number = 1) {
  const response = await fetch(`https://api.github.com/search/repositories?q=topic:reactjs&per_page=30&page=${nextCursor}`);
  if(response.status != 200) throw Error("error");

  return await response.json() as Page;
}

export default function ISBoard() {

  const {
    pages,
    status,
    goNextPage,
    getCurrentCursor,
    isNextPage
  } = useInfinitePage<Page, {}>(
    {
      getNextCursor,
      fetchNextPage
    },
    [
      (context, comming) => {
        console.log(context, comming);
        return comming;
      }
    ]
  );


  useEffect(() => {

    const [installEvent, uninstallEvent] = 
      getScrollDispatcher(100, ()=>{
        if(isNextPage()){
          console.log(getCurrentCursor());
          goNextPage();
        }
      });

    installEvent();

    return ()=>uninstallEvent();

  }, []);

  return (
    <div>
      {
        status === 'loading' 
          ? (
            <>
              Loading...
            </>
          )
          : (
            pages.map(page=> (
              page.items.map(it=> (
                <p key={it.id}>{it.name}</p>
              ))
            ))
          )
      }
    </div>
  )
}