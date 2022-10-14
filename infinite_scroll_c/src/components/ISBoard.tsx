import { useEffect } from "react";
import { getScrollDispatcher } from "../lib/tools";
import useInfinitePage, { Context } from "../lib/useInfinitePage";

interface Page {
  total_count: number,
  items: any[]
}

interface Bundle {
  per: number
}

function getNextCursor(pages: Page[], bundle: Bundle) {
  const expect = pages.length + 1;
  const limit = Math.ceil(pages[pages.length-1].total_count / bundle.per);

  return limit > expect ? expect : undefined;
}

async function fetchNextPage(nextCursor = 1, bundle : Bundle) {
  const response = await fetch(`https://api.github.com/search/repositories?q=topic:reactjs&per_page=${bundle.per}&page=${nextCursor}`);
  if(response.status != 200) throw Error(await response.text());

  return await response.json() as Page;
}

function logPlugin(context: Context<Page, Bundle>, comming: Page) {
  console.log(context);
  return comming;
}

export default function ISBoard() {

  const {
    pages,
    status,
    getCurrentCursor,
    fetchNext,
    isNext
  } = useInfinitePage<Page, Bundle>(
    { getNextCursor, fetchNextPage },
    [logPlugin],
    { per: 30 }
  );

  useEffect(() => {

    const [installEvent, uninstallEvent] = 
      getScrollDispatcher(100, async ()=>{
        if(isNext() && await fetchNext()){
          console.log(getCurrentCursor());
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