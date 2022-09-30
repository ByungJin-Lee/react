import { useState, useEffect } from "react";

//#region 'useInfiniteScroll'

function useScrollDispatcher(sensitive, callback) {
  
  const listener = (evt) => {

    let totalHeight = document.body.clientHeight;
    let currentBottomPos = window.scrollY + window.innerHeight;

    if(totalHeight <= currentBottomPos + sensitive) {
      callback();
    }
  }

  const install = _=>{
    window.addEventListener('scroll', listener);
  }

  const uninstall = _=>{
    window.removeEventListener('scroll', listener);
  }

  return [install, uninstall];
}


function useInfiniteScroll(
  itemCountPerScroll,
  callback,
  sensitive
) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  /**
   * Call callback when page's value is updated.
   */
  useEffect(() => {

    const [installEvent, uninstallEvent] = 
      useScrollDispatcher(sensitive, _=>setPage(page+1));

    installEvent();
    
    callback(page, itemCountPerScroll)
      .then(value=>{
        setItems(prev => prev.concat(value));
      })
      .catch(err=>{
        console.log(err)
      })

    return _=>uninstallEvent();

  }, [page, sensitive]);

  return [items, page];
}
//#endregion 'useInfiniteScroll'

//#region 'generateDumbBoardItems'
function generateDumbBoardItems(limit) {
  const items = [];

  for(let i = 0; i < limit; i++){
    items.push({
      title: `apple~ ${i}`,
      writer: 'writer',
      tags: ['t1'],
      thumbnailUrls: {
        'x192' : 'https://img.freepik.com/premium-photo/ripe-red-apple-isolated-on-a-white-background_146936-1364.jpg?w=2000'
      }
    })
  }

  return items;
}
//#endregion

export {
  useInfiniteScroll,
  generateDumbBoardItems
}