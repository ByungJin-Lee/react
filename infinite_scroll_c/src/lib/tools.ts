
function debounce(
  callback: () => void, 
  delay: number
) {
  let watcher : number = 0;
  return () => {
    if(watcher) {
      clearTimeout(watcher);
    }
    watcher = setTimeout(callback, delay);
  }
}

function getScrollDispatcher(
  sensitive: number, 
  callback: ()=>void
) {

  const listener = debounce(()=>{
    let totalHeight = document.body.clientHeight;
    let currentBottomPos = window.scrollY + window.innerHeight;

    if(totalHeight <= currentBottomPos + sensitive) {
      callback();
    }
  }, 150);

  const install = () => {
    window.addEventListener('scroll', listener);
  }

  const uninstall = () => {
    window.removeEventListener('scroll', listener);
  }

  return [install, uninstall];
}


function generateDumbBoardItems(limit: number) {
  const items = [];

  const thumbnails = [
    'https://health.chosun.com/site/data/img_dir/2022/05/04/2022050401754_0.jpg',
    'https://img.freepik.com/premium-photo/ripe-red-apple-isolated-on-a-white-background_146936-1364.jpg?w=2000',
    'http://kormedi.com/wp-content/uploads/2020/09/201601291054128818_l_99_201601291123031.jpg',
    'http://res.heraldm.com/phpwas/restmb_idxmake.php?idx=507&simg=/content/image/2017/06/29/20170629000606_0.jpg'
  ]

  for(let i = 0; i < limit; i++){
    items.push({
      title: `제목~ ${i}`,
      subTitle: '부제목',
      detail: '무한 사과농장',
      writer: '작성자',
      tags: ['t1'],
      thumbnailUrls: {
        'x192' : thumbnails[Math.floor(Math.random() * 4)]
      }
    })
  }

  return {
    items,
    slice(start : number, end : number) {
      return this.items.slice(
        Math.min(start, this.items.length),
        Math.min(end, this.items.length)
      )
    }
  };
}


/**
 * This function for infinite scroll item
 * @param items 
 */
 function countDuplicatedItems(
  prevItems: never[], 
  addedFirstItem: never, 
  compare: (lhs : never, rhs: never) => boolean
) {
  let count = 0;

  for(let i = prevItems.length - 1; i >= 0; i--) {
    if(compare(prevItems[i], addedFirstItem)){
      count = prevItems.length - i;
      break;
    }
  }
  
  return count;
}

function processDuplicated(
  prevItems: never[],
  addedItems: never[],
  compare: (lhs: never, rhs: never) => boolean,
) : [never[], number] {

  if(addedItems.length === 0) return [[], 0]; 

  const numOfDuplicated = countDuplicatedItems(
    prevItems,
    addedItems[0],
    compare
  );

  return [
    addedItems.slice(numOfDuplicated),
    numOfDuplicated
  ];
}

export {
  generateDumbBoardItems,
  getScrollDispatcher,
  debounce,
  processDuplicated,
  countDuplicatedItems
}